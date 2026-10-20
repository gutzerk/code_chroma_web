import type { Metadata } from "next";
import ConfigurationRedirect from "./ConfigurationRedirect";

export const metadata: Metadata = {
  title: "Settings — CodeChroma",
  description: "CodeChroma settings now live in the documentation.",
};

/** Configuration moved into the documentation as "Settings". Static export has no server
    redirects, so this page forwards visitors with old links on the client. */
export default function ConfigurationPage() {
  return (
    <main className="mx-auto w-full max-w-[110rem] flex-1 px-5 sm:px-10 lg:px-6">
      <ConfigurationRedirect />
    </main>
  );
}
