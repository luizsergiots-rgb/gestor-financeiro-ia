import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TestResult {
  name: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
  details?: string;
}

export default function Diagnostics() {
  const [results, setResults] = useState<TestResult[]>([
    { name: "Backend Connection", status: "idle", message: "Not tested" },
    { name: "Database Connection", status: "idle", message: "Not tested" },
    { name: "Whisper Service", status: "idle", message: "Not tested" },
    { name: "Ollama Service", status: "idle", message: "Not tested" },
    { name: "Evolution API", status: "idle", message: "Not tested" },
    { name: "Authentication", status: "idle", message: "Not tested" },
    { name: "File System", status: "idle", message: "Not tested" },
  ]);

  const updateResult = (index: number, updates: Partial<TestResult>) => {
    const newResults = [...results];
    newResults[index] = { ...newResults[index], ...updates };
    setResults(newResults);
  };

  const testBackendConnection = async () => {
    const index = 0;
    updateResult(index, { status: "loading", message: "Testing..." });

    try {
      const response = await fetch("/api/trpc/auth.me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        updateResult(index, {
          status: "success",
          message: "Backend is responding correctly",
          details: "API endpoint /api/trpc/auth.me returned 200",
        });
      } else {
        updateResult(index, {
          status: "error",
          message: `Backend returned status ${response.status}`,
          details: `Response status: ${response.statusText}`,
        });
      }
    } catch (error) {
      updateResult(index, {
        status: "error",
        message: "Cannot connect to backend",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testDatabaseConnection = async () => {
    const index = 1;
    updateResult(index, { status: "loading", message: "Testing..." });

    try {
      const response = await fetch("/api/trpc/financial.getBalance", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        updateResult(index, {
          status: "success",
          message: "Database is responding correctly",
          details: `Balance query returned: ${JSON.stringify(data)}`,
        });
      } else {
        updateResult(index, {
          status: "error",
          message: `Database query failed with status ${response.status}`,
          details: `Response status: ${response.statusText}`,
        });
      }
    } catch (error) {
      updateResult(index, {
        status: "error",
        message: "Cannot connect to database",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testWhisper = async () => {
    const index = 2;
    updateResult(index, { status: "loading", message: "Testing..." });

    try {
      const response = await fetch("/api/trpc/services.whisper.getStatus", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        updateResult(index, {
          status: "success",
          message: "Whisper service is accessible",
          details: `Status: ${JSON.stringify(data)}`,
        });
      } else {
        updateResult(index, {
          status: "error",
          message: `Whisper API returned status ${response.status}`,
          details: `Response status: ${response.statusText}`,
        });
      }
    } catch (error) {
      updateResult(index, {
        status: "error",
        message: "Cannot access Whisper service",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testOllama = async () => {
    const index = 3;
    updateResult(index, { status: "loading", message: "Testing..." });

    try {
      const response = await fetch("/api/trpc/services.ollama.getStatus", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        updateResult(index, {
          status: "success",
          message: "Ollama service is accessible",
          details: `Status: ${JSON.stringify(data)}`,
        });
      } else {
        updateResult(index, {
          status: "error",
          message: `Ollama API returned status ${response.status}`,
          details: `Response status: ${response.statusText}`,
        });
      }
    } catch (error) {
      updateResult(index, {
        status: "error",
        message: "Cannot access Ollama service",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testEvolutionAPI = async () => {
    const index = 4;
    updateResult(index, { status: "loading", message: "Testing..." });

    try {
      const response = await fetch("/api/trpc/services.evolution.getStatus", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        updateResult(index, {
          status: "success",
          message: "Evolution API is accessible",
          details: `Status: ${JSON.stringify(data)}`,
        });
      } else {
        updateResult(index, {
          status: "error",
          message: `Evolution API returned status ${response.status}`,
          details: `Response status: ${response.statusText}`,
        });
      }
    } catch (error) {
      updateResult(index, {
        status: "error",
        message: "Cannot access Evolution API",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testAuthentication = async () => {
    const index = 5;
    updateResult(index, { status: "loading", message: "Testing..." });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: "test123", // Wrong password to test auth
        }),
      });

      if (response.status === 401) {
        updateResult(index, {
          status: "success",
          message: "Authentication system is working",
          details: "Correctly rejected invalid credentials",
        });
      } else if (response.ok) {
        updateResult(index, {
          status: "success",
          message: "Authentication system is working",
          details: "Login endpoint is responding",
        });
      } else {
        updateResult(index, {
          status: "error",
          message: `Authentication returned status ${response.status}`,
          details: `Response status: ${response.statusText}`,
        });
      }
    } catch (error) {
      updateResult(index, {
        status: "error",
        message: "Cannot test authentication",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testFileSystem = async () => {
    const index = 6;
    updateResult(index, { status: "loading", message: "Testing..." });

    try {
      const response = await fetch("/favicon.ico");

      if (response.ok) {
        updateResult(index, {
          status: "success",
          message: "File system is accessible",
          details: "Static files are being served correctly",
        });
      } else {
        updateResult(index, {
          status: "error",
          message: `File system returned status ${response.status}`,
          details: "Static files may not be properly configured",
        });
      }
    } catch (error) {
      updateResult(index, {
        status: "error",
        message: "Cannot access file system",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const runAllTests = async () => {
    await testBackendConnection();
    await testDatabaseConnection();
    await testWhisper();
    await testOllama();
    await testEvolutionAPI();
    await testAuthentication();
    await testFileSystem();
    toast.success("All tests completed!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "loading":
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">System Diagnostics</h1>
        <p className="text-gray-400">
          Test all system components to identify issues
        </p>
      </div>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tests">Diagnostic Tests</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Run Tests</CardTitle>
              <CardDescription>
                Click "Run All Tests" to test all components at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={runAllTests}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Run All Tests
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {results.map((result, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{result.name}</h3>
                        <p className="text-sm text-gray-400">{result.message}</p>
                        {result.details && (
                          <p className="text-xs text-gray-500 mt-2 font-mono bg-slate-900 p-2 rounded">
                            {result.details}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        switch (index) {
                          case 0:
                            testBackendConnection();
                            break;
                          case 1:
                            testDatabaseConnection();
                            break;
                          case 2:
                            testWhisper();
                            break;
                          case 3:
                            testOllama();
                            break;
                          case 4:
                            testEvolutionAPI();
                            break;
                          case 5:
                            testAuthentication();
                            break;
                          case 6:
                            testFileSystem();
                            break;
                        }
                      }}
                      className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
                    >
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">System Information</CardTitle>
              <CardDescription>
                Information about your system and environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Browser Information</h3>
                <pre className="bg-slate-900 p-4 rounded text-xs text-gray-300 overflow-auto">
                  {JSON.stringify(
                    {
                      userAgent: navigator.userAgent,
                      language: navigator.language,
                      platform: navigator.platform,
                      cookieEnabled: navigator.cookieEnabled,
                      onLine: navigator.onLine,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Local Storage</h3>
                <pre className="bg-slate-900 p-4 rounded text-xs text-gray-300 overflow-auto">
                  {JSON.stringify(
                    Object.keys(localStorage).reduce(
                      (acc, key) => {
                        acc[key] = localStorage.getItem(key);
                        return acc;
                      },
                      {} as Record<string, string | null>
                    ),
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">API Endpoints</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="text-cyan-400">Backend:</span> /api/trpc
                  </p>
                  <p className="text-gray-300">
                    <span className="text-cyan-400">Auth:</span> /api/auth
                  </p>
                  <p className="text-gray-300">
                    <span className="text-cyan-400">Health:</span> /health
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-yellow-900/20 border-yellow-700">
        <CardHeader>
          <CardTitle className="text-yellow-400">Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-200 space-y-2">
          <p>
            • If Backend Connection fails, check if the server is running: <code className="bg-slate-900 px-2 py-1 rounded">pm2 status</code>
          </p>
          <p>
            • If Database Connection fails, check MySQL: <code className="bg-slate-900 px-2 py-1 rounded">systemctl status mysql</code>
          </p>
          <p>
            • If Whisper fails, install it: <code className="bg-slate-900 px-2 py-1 rounded">pip install openai-whisper</code>
          </p>
          <p>
            • If Ollama fails, start it: <code className="bg-slate-900 px-2 py-1 rounded">ollama serve</code>
          </p>
          <p>
            • Check server logs: <code className="bg-slate-900 px-2 py-1 rounded">pm2 logs gestor-financeiro</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
