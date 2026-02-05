// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { AuthProvider, AuthContext } from './context/AuthContext'; // Added AuthProvider and AuthContext

// ... imports ...


// Auth Pages
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';

// Layout
import Navbar from './components/layout/Navbar';
import RequireWorkspace from './components/layout/RequireWorkspace';
import FacebookGate from './components/FacebookGate';

// Pages
import DashboardPage from './pages/DashboardPage';
import WorkspacesPage from './pages/WorkspacesPage';
import CreateWorkspacePage from './pages/CreateWorkspacePage';
import ChatsPage from './pages/ChatsPage';
import ContactsPage from './pages/ContactsPage';
import BroadcastsPage from './pages/BroadcastsPage';
import BroadcastDetailPage from './pages/BroadcastDetailPage';
import AutomationsPage from './pages/AutomationsPage';
import CampaignsPage from './pages/CampaignsPage';
import ApiKeysPage from './pages/ApiKeysPage';
import SettingsPage from './pages/SettingsPage';

// WhatsApp Feature Pages
import WhatsAppFeaturesPage from './pages/WhatsAppFeaturesPage';
import TemplatesPage from './pages/whatsapp/TemplatesPage';
import CreateTemplatePage from './pages/whatsapp/CreateTemplatePage';
import PhoneNumbersPage from './pages/whatsapp/PhoneNumbersPage';
import ConnectPhoneNumberPage from './pages/whatsapp/ConnectPhoneNumberPage';
import WhatsAppProfilePage from './pages/whatsapp/WhatsAppProfilePage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';

/* =========================
   Protected Route Component
========================= */
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
};

/* =========================
   App Component
========================= */
/* =========================
   App Component
========================= */
function App() {
    return (
        <Router>
            <AuthProvider>
                <WorkspaceAppContent />
            </AuthProvider>
        </Router>
    );
}

// Separate component to consume AuthContext
const WorkspaceAppContent = () => {
    const { user, loading } = useContext(AuthContext);
    // Show navbar if user is loaded OR if we have a token (optimistic)
    const isAuthenticated = !!user || !!localStorage.getItem('token');

    if (loading) return <div className="text-center p-5">Loading App...</div>;

    return (
        <WorkspaceProvider>
            <div className="App">
                {/* Navbar only when logged in */}
                {isAuthenticated && <Navbar />}

                <main className={isAuthenticated ? 'py-4' : ''}>
                    <Routes>

                        {/* ===== PUBLIC ROUTES ===== */}
                        <Route
                            path="/login"
                            element={isAuthenticated ? <Navigate to="/account/workspaces" /> : <LoginPage />}
                        />

                        <Route
                            path="/signup"
                            element={isAuthenticated ? <Navigate to="/account/workspaces" /> : <SignupPage />}
                        />

                        <Route
                            path="/forgot-password"
                            element={isAuthenticated ? <Navigate to="/account/workspaces" /> : <ForgotPasswordPage />}
                        />

                        <Route
                            path="/reset-password/:token"
                            element={isAuthenticated ? <Navigate to="/account/workspaces" /> : <ResetPasswordPage />}
                        />

                        {/* ===== PROTECTED ROUTES ===== */}
                        <Route
                            path="/account/workspaces"
                            element={<PrivateRoute><WorkspacesPage /></PrivateRoute>}
                        />

                        <Route
                            path="/create-workspace"
                            element={<PrivateRoute><CreateWorkspacePage /></PrivateRoute>}
                        />

                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <RequireWorkspace>
                                        <FacebookGate>
                                            <DashboardPage />
                                        </FacebookGate>
                                    </RequireWorkspace>
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/chats"
                            element={<PrivateRoute><RequireWorkspace><FacebookGate><ChatsPage /></FacebookGate></RequireWorkspace></PrivateRoute>}
                        />

                        <Route
                            path="/contacts"
                            element={<PrivateRoute><RequireWorkspace><FacebookGate><ContactsPage /></FacebookGate></RequireWorkspace></PrivateRoute>}
                        />

                        <Route
                            path="/broadcasts"
                            element={<PrivateRoute><RequireWorkspace><FacebookGate><BroadcastsPage /></FacebookGate></RequireWorkspace></PrivateRoute>}
                        />
                        <Route
                            path="/broadcasts/:id"
                            element={<PrivateRoute><RequireWorkspace><FacebookGate><BroadcastDetailPage /></FacebookGate></RequireWorkspace></PrivateRoute>}
                        />

                        <Route
                            path="/automations"
                            element={<PrivateRoute><RequireWorkspace><FacebookGate><AutomationsPage /></FacebookGate></RequireWorkspace></PrivateRoute>}
                        />

                        <Route
                            path="/templates"
                            element={<PrivateRoute><RequireWorkspace><FacebookGate><TemplatesPage /></FacebookGate></RequireWorkspace></PrivateRoute>}
                        />

                        <Route
                            path="/campaigns"
                            element={<PrivateRoute><RequireWorkspace><FacebookGate><CampaignsPage /></FacebookGate></RequireWorkspace></PrivateRoute>}
                        />

                        <Route
                            path="/api-keys"
                            element={<PrivateRoute><ApiKeysPage /></PrivateRoute>}
                        />

                        <Route
                            path="/settings"
                            element={<PrivateRoute><SettingsPage /></PrivateRoute>}
                        />

                        <Route
                            path="/profile"
                            element={<PrivateRoute><ProfilePage /></PrivateRoute>}
                        />

                        <Route
                            path="/pricing"
                            element={<PrivateRoute><PricingPage /></PrivateRoute>}
                        />

                        <Route
                            path="/whatsapp"
                            element={<PrivateRoute><WhatsAppFeaturesPage /></PrivateRoute>}
                        />

                        <Route
                            path="/whatsapp/templates"
                            element={<PrivateRoute><TemplatesPage /></PrivateRoute>}
                        />

                        <Route
                            path="/whatsapp/templates/create"
                            element={<PrivateRoute><CreateTemplatePage /></PrivateRoute>}
                        />

                        <Route
                            path="/whatsapp/phone-numbers"
                            element={<PrivateRoute><PhoneNumbersPage /></PrivateRoute>}
                        />

                        <Route
                            path="/whatsapp/connect-number"
                            element={<PrivateRoute><ConnectPhoneNumberPage /></PrivateRoute>}
                        />

                        <Route
                            path="/whatsapp/profile"
                            element={<PrivateRoute><WhatsAppProfilePage /></PrivateRoute>}
                        />



                        {/* DEFAULT FALLBACK */}
                        <Route
                            path="*"
                            element={<Navigate to={isAuthenticated ? '/chats' : '/login'} />}
                        />

                    </Routes>
                </main>
            </div>
        </WorkspaceProvider>
    );
};

export default App; 