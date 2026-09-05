import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/Login";
import { DashboardPage } from "../pages/Dashboard";
import { InvestigatePage } from "../pages/Investigate";
import { CaseDetailPage } from "../pages/CaseDetail";
import { ThreatIntelligencePage } from "../pages/ThreatIntelligence";
import { CasesPage } from "../pages/Cases";
import { ReportsPage } from "../pages/Reports";
import { SettingsPage } from "../pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "investigate", element: <InvestigatePage /> },
      { path: "cases", element: <CasesPage /> },
      { path: "cases/:caseId", element: <CaseDetailPage /> },
      { path: "threat-intel", element: <ThreatIntelligencePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
