"use client";

import { useEffect } from "react";
import DevChatInterface from "@/components/chatInterface";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import Head from "next/head";

export default function Home() {
  const { user } = useDynamicContext();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("#chat");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Head>
        <title>Code Senpai - AI Assistant for Sei Blockchain Developers</title>
        <meta name="description" content="RAG-based AI framework to help developers build on Sei blockchain" />
      </Head>

      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Code Senpai
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="hover:text-purple-400 transition">
              Features
            </a>
            <a href="#vscode" className="hover:text-purple-400 transition">
              VSCode Extension
            </a>
            <a href="#chat" className="hover:text-purple-400 transition">
              Chat Interface
            </a>
          </div>
          <DynamicWidget />
        </div>
      </header>

      <main>
        {user ? (
          <section id="chat" className="py-8">
            <DevChatInterface />
          </section>
        ) : (
          <>
            {/* Hero Section */}
            <section className="py-20 px-4">
              <div className="container mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Your <span className="text-purple-400">AI Senpai</span> for
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    Sei Blockchain
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
                  A RAG-powered AI assistant that helps you build faster on Sei
                  with intelligent code generation, documentation, and debugging.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    href="#features"
                    className="px-8 py-3 bg-transparent border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-900/30 transition"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 px-4 bg-gray-800/50">
              <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">
                  Powerful Features for Sei Developers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Smart Code Generation
                    </h3>
                    <p className="text-gray-300">
                      Generate Sei-specific code snippets, smart contracts, and
                      boilerplate with AI assistance.
                    </p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Documentation Assistant
                    </h3>
                    <p className="text-gray-300">
                      Get instant answers about Sei&apos;s documentation, APIs, and
                      best practices.
                    </p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Debugging Support
                    </h3>
                    <p className="text-gray-300">
                      Diagnose issues in your Sei contracts and get suggested
                      fixes from our AI.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* VSCode Extension Section */}
            <section id="vscode" className="py-16 px-4">
              <div className="container mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="md:w-1/2">
                    <div className="relative">
                      <div className="absolute -top-4 -left-4 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
                      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
                      <div className="relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                        <div className="bg-gray-900 h-8 flex items-center px-3 border-b border-gray-700">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="p-4">
                          <div className="text-sm font-mono text-gray-300">
                            <div className="text-purple-400">{/* Coming Soon */}</div>
                            <div className="text-purple-400">
                              {/* VSCode Extension */}
                            </div>
                            <div className="mt-4">
                              <span className="text-blue-400">const</span>{" "}
                              <span className="text-yellow-300">contract</span> ={" "}
                              <span className="text-green-400">await</span>{" "}
                              <span className="text-yellow-300">
                                senpai.generateContract
                              </span>
                              (&#123;
                            </div>
                            <div className="ml-4">
                              <span className="text-blue-400">type</span>:{" "}
                              <span className="text-green-400">
                                &quot;sei-smart-contract&quot;
                              </span>
                              ,
                            </div>
                            <div className="ml-4">
                              <span className="text-blue-400">purpose</span>:{" "}
                              <span className="text-green-400">
                                &quot;NFT marketplace&quot;
                              </span>
                            </div>
                            <div>&#125;);</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <h2 className="text-3xl font-bold mb-6">
                      <span className="text-purple-400">VSCode Extension</span>{" "}
                      Coming Soon
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Integrate Code Senpai directly into your development
                      workflow with our upcoming VSCode extension. Get AI
                      assistance without leaving your IDE.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-300">
                          Context-aware code completions for Sei development
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-300">
                          Right-click to generate documentation or tests
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-300">
                          Instant error explanations and fixes
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Chat Interface CTA */}
            <section id="chat" className="py-16 px-4 bg-gray-800/50">
              <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">
                  Try the <span className="text-purple-400">Code Senpai</span>{" "}
                  Chat Interface
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                  Connect your wallet to access our AI chat interface and start
                  building on Sei with expert guidance.
                </p>
                <div className="w-full items-center flex justify-center">
                  <DynamicWidget />
                </div>
                {!user && (
                  <p className="mt-8 text-lg text-gray-400">
                    Wallet connection required to access the chat interface
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-bold">Code Senpai</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Code Senpai - AI Assistant for Sei
              Blockchain Developers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}