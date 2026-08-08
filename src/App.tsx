/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InvestProvider } from './context/InvestContext';
import { AndroidShell } from './components/AndroidShell';
import { AdminProtectedRoute } from './admin/AdminProtectedRoute';

// View Pages
import { DashboardView } from './views/DashboardView';
import { PlansView } from './views/PlansView';
import { TransactionsView } from './views/TransactionsView';
import { TasksView } from './views/TasksView';
import { ReferralView } from './views/ReferralView';
import { DocumentsView } from './views/DocumentsView';
import { ProfileView } from './views/ProfileView';
import { AuthView } from './views/AuthView';

// Modals
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { YieldCalculatorModal } from './components/YieldCalculatorModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Transaction } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();

  const isAdminPath = typeof window !== 'undefined' && window.location.pathname === '/admin';

  if (isAdminPath) {
    return <AdminProtectedRoute />;
  }

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
  };

  const renderActiveView = () => {
    if (!user && currentTab !== 'documents') {
      return <AuthView onSuccess={() => setCurrentTab('dashboard')} />;
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenAI={() => setIsAIOpen(true)}
            onSelectTransaction={(tx) => setSelectedTxForReceipt(tx)}
          />
        );
      case 'plans':
        return (
          <PlansView
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenDeposit={() => setIsDepositOpen(true)}
          />
        );
      case 'transactions':
        return (
          <TransactionsView
            onSelectTransaction={(tx) => setSelectedTxForReceipt(tx)}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
          />
        );
      case 'tasks':
        return <TasksView />;
      case 'referrals':
        return <ReferralView />;
      case 'documents':
        return <DocumentsView />;
      case 'profile':
        return <ProfileView />;
      case 'auth':
        return <AuthView onSuccess={() => setCurrentTab('dashboard')} />;
      default:
        return (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenAI={() => setIsAIOpen(true)}
            onSelectTransaction={(tx) => setSelectedTxForReceipt(tx)}
          />
        );
    }
  };

  return (
    <AndroidShell
      currentTab={currentTab}
      onNavigate={handleNavigate}
      onOpenDeposit={() => setIsDepositOpen(true)}
      onOpenWithdraw={() => setIsWithdrawOpen(true)}
      onOpenAI={() => setIsAIOpen(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
        >
          {renderActiveView()}
        </motion.div>
      </AnimatePresence>

      {/* Modals & Portals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
      <YieldCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onSelectPlan={() => handleNavigate('plans')}
      />
      <AIAssistantModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <ReceiptModal
        transaction={selectedTxForReceipt}
        onClose={() => setSelectedTxForReceipt(null)}
      />
    </AndroidShell>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <InvestProvider>
        <MainApp />
      </InvestProvider>
    </AuthProvider>
  );
}
