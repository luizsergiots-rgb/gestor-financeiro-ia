import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { exec } from "child_process";
import { promisify } from "util";
import { readdir, readFile, unlink } from "fs/promises";
import { join } from "path";

const execAsync = promisify(exec);

const BACKUP_DIR = "/tmp/gestor-backups";

export const databaseRouter = router({
  // Create a backup of the database
  createBackup: protectedProcedure.mutation(async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `gestor_backup_${timestamp}.sql`;
      const filepath = join(BACKUP_DIR, filename);

      // Ensure backup directory exists
      await execAsync(`mkdir -p ${BACKUP_DIR}`);

      // Create backup using mysqldump
      const dbUrl = process.env.DATABASE_URL || "";
      if (!dbUrl) {
        return { success: false, message: "Database URL not configured" };
      }

      // Parse database connection string
      // Format: mysql://user:password@host:port/database
      const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (!urlMatch) {
        return { success: false, message: "Invalid database URL format" };
      }

      const [, user, password, host, port, database] = urlMatch;

      // Create backup
      await execAsync(
        `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database} > ${filepath}`,
        { timeout: 300000 }
      );

      // Get file size
      const stats = await execAsync(`ls -lh ${filepath}`);
      const sizeMatch = stats.stdout.match(/\s+(\S+)\s+$/);
      const size = sizeMatch ? sizeMatch[1] : "unknown";

      return {
        success: true,
        filename,
        filepath,
        size,
        timestamp: new Date().toISOString(),
        message: `Backup criado com sucesso: ${filename}`,
      };
    } catch (error) {
      console.error("Backup error:", error);
      return {
        success: false,
        message: `Erro ao criar backup: ${String(error)}`,
      };
    }
  }),

  // List all available backups
  listBackups: protectedProcedure.query(async () => {
    try {
      await execAsync(`mkdir -p ${BACKUP_DIR}`);
      const files = await readdir(BACKUP_DIR);

      const backups = await Promise.all(
        files
          .filter((f) => f.startsWith("gestor_backup_") && f.endsWith(".sql"))
          .map(async (filename) => {
            const filepath = join(BACKUP_DIR, filename);
            try {
              const stats = await execAsync(`ls -lh ${filepath}`);
              const sizeMatch = stats.stdout.match(/\s+(\S+)\s+$/);
              const size = sizeMatch ? sizeMatch[1] : "unknown";

              // Extract timestamp from filename
              const timestampStr = filename.replace("gestor_backup_", "").replace(".sql", "");
              const timestamp = timestampStr.replace(/-/g, (m, offset) => {
                // Restore colons in time portion
                if (offset > 10) return ":";
                return m;
              });

              return {
                filename,
                filepath,
                size,
                timestamp,
                createdAt: new Date(timestamp),
              };
            } catch {
              return null;
            }
          })
      );

      return {
        success: true,
        backups: backups.filter(Boolean).sort((a, b) => (b?.createdAt.getTime() || 0) - (a?.createdAt.getTime() || 0)),
      };
    } catch (error) {
      console.error("List backups error:", error);
      return {
        success: false,
        backups: [],
        message: `Erro ao listar backups: ${String(error)}`,
      };
    }
  }),

  // Restore from a backup
  restoreBackup: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Validate filename to prevent path traversal
        if (!input.filename.startsWith("gestor_backup_") || !input.filename.endsWith(".sql")) {
          return { success: false, message: "Invalid backup filename" };
        }

        const filepath = join(BACKUP_DIR, input.filename);

        // Verify file exists
        await readFile(filepath);

        const dbUrl = process.env.DATABASE_URL || "";
        if (!dbUrl) {
          return { success: false, message: "Database URL not configured" };
        }

        // Parse database connection string
        const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (!urlMatch) {
          return { success: false, message: "Invalid database URL format" };
        }

        const [, user, password, host, port, database] = urlMatch;

        // Restore backup
        await execAsync(
          `mysql -h ${host} -P ${port} -u ${user} -p${password} ${database} < ${filepath}`,
          { timeout: 300000 }
        );

        return {
          success: true,
          message: `Backup restaurado com sucesso: ${input.filename}`,
          filename: input.filename,
          restoredAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Restore error:", error);
        return {
          success: false,
          message: `Erro ao restaurar backup: ${String(error)}`,
        };
      }
    }),

  // Delete a backup
  deleteBackup: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Validate filename to prevent path traversal
        if (!input.filename.startsWith("gestor_backup_") || !input.filename.endsWith(".sql")) {
          return { success: false, message: "Invalid backup filename" };
        }

        const filepath = join(BACKUP_DIR, input.filename);

        // Delete file
        await unlink(filepath);

        return {
          success: true,
          message: `Backup deletado com sucesso: ${input.filename}`,
        };
      } catch (error) {
        console.error("Delete backup error:", error);
        return {
          success: false,
          message: `Erro ao deletar backup: ${String(error)}`,
        };
      }
    }),

  // Get database statistics
  getStatistics: protectedProcedure.query(async () => {
    try {
      const dbUrl = process.env.DATABASE_URL || "";
      if (!dbUrl) {
        return { success: false, message: "Database URL not configured" };
      }

      // Parse database connection string
      const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (!urlMatch) {
        return { success: false, message: "Invalid database URL format" };
      }

      const [, user, password, host, port, database] = urlMatch;

      // Get database size
      const sizeResult = await execAsync(
        `mysql -h ${host} -P ${port} -u ${user} -p${password} -e "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb FROM information_schema.tables WHERE table_schema = '${database}';" --skip-column-names`
      );

      const size = parseFloat(sizeResult.stdout.trim()) || 0;

      // Get table count
      const tablesResult = await execAsync(
        `mysql -h ${host} -P ${port} -u ${user} -p${password} -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${database}';" --skip-column-names`
      );

      const tableCount = parseInt(tablesResult.stdout.trim()) || 0;

      return {
        success: true,
        database,
        size_mb: size,
        tableCount,
        host,
        port: parseInt(port),
      };
    } catch (error) {
      console.error("Statistics error:", error);
      return {
        success: false,
        message: `Erro ao obter estatísticas: ${String(error)}`,
      };
    }
  }),

  // Download backup file
  downloadBackup: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .query(async ({ input }) => {
      try {
        // Validate filename to prevent path traversal
        if (!input.filename.startsWith("gestor_backup_") || !input.filename.endsWith(".sql")) {
          return { success: false, message: "Invalid backup filename" };
        }

        const filepath = join(BACKUP_DIR, input.filename);

        // Read file content
        const content = await readFile(filepath, "utf-8");

        return {
          success: true,
          filename: input.filename,
          content,
          size: content.length,
        };
      } catch (error) {
        console.error("Download backup error:", error);
        return {
          success: false,
          message: `Erro ao baixar backup: ${String(error)}`,
        };
      }
    }),
});
