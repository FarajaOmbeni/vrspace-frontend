import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '@/views/About.vue'
import Experiences from '@/views/Experiences.vue'
import Contact from '@/views/Contact.vue'
import Marketplace from '@/views/Marketplace.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public routes ──
    {
      path: '/',
      name: 'Homey',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/experiences',
      name: 'Experiences',
      component: Experiences
    },
    {
      path: '/marketplace',
      name: 'Marketplace',
      component: Marketplace
    },
    {
      path: '/contact',
      name: 'Contact',
      component: Contact
    },

    // ── Admin routes ──
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/admin/Login.vue'),
      meta: { isAdmin: true }
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/views/admin/ForgotPassword.vue'),
      meta: { isAdmin: true }
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('@/views/admin/ResetPassword.vue'),
      meta: { isAdmin: true }
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { isAdmin: true, requiresAuth: true },
      children: [
        {
          path: '',
          name: 'AdminRoot',
          redirect: () => '/admin/clock'
        },
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'clock',
          name: 'AdminClock',
          component: () => import('@/views/admin/attendance/ClockInOut.vue')
        },
        {
          path: 'sessions',
          name: 'AdminSessions',
          component: () => import('@/views/admin/sessions/SessionLogger.vue')
        },
        {
          path: 'sessions/history',
          name: 'AdminSessionHistory',
          component: () => import('@/views/admin/sessions/SessionHistory.vue')
        },
        {
          path: 'attendance',
          name: 'AdminAttendance',
          component: () => import('@/views/admin/attendance/AttendanceLog.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'attendance/hours',
          name: 'AdminEmployeeHours',
          component: () => import('@/views/admin/attendance/EmployeeHours.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'sales',
          name: 'AdminSales',
          component: () => import('@/views/admin/sales/DailySalesForm.vue')
        },
        {
          path: 'sales/reports',
          name: 'AdminSalesReports',
          component: () => import('@/views/admin/sales/SalesReport.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'sales/discrepancies',
          name: 'AdminDiscrepancies',
          component: () => import('@/views/admin/sales/DiscrepancyView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'machines',
          name: 'AdminMachines',
          component: () => import('@/views/admin/machines/MachineList.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'machines/new',
          name: 'AdminMachineNew',
          component: () => import('@/views/admin/machines/MachineForm.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'machines/:id/edit',
          name: 'AdminMachineEdit',
          component: () => import('@/views/admin/machines/MachineForm.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'employees',
          name: 'AdminEmployees',
          component: () => import('@/views/admin/employees/EmployeeList.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'employees/new',
          name: 'AdminEmployeeNew',
          component: () => import('@/views/admin/employees/EmployeeForm.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'settings',
          name: 'AdminSettings',
          component: () => import('@/views/admin/Settings.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'finance',
          name: 'AdminFinance',
          component: () => import('@/views/admin/finance/MonthlyOverview.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'finance/templates',
          name: 'AdminExpenseTemplates',
          component: () => import('@/views/admin/finance/ExpenseTemplates.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'finance/expense/new',
          name: 'AdminExpenseNew',
          component: () => import('@/views/admin/finance/ExpenseForm.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'finance/expense/:id/edit',
          name: 'AdminExpenseEdit',
          component: () => import('@/views/admin/finance/ExpenseForm.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'finance/income/new',
          name: 'AdminIncomeNew',
          component: () => import('@/views/admin/finance/AdditionalIncomeForm.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'finance/income/:id/edit',
          name: 'AdminIncomeEdit',
          component: () => import('@/views/admin/finance/AdditionalIncomeForm.vue'),
          meta: { requiresAdmin: true }
        },
      ]
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// ── Navigation guards ──
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth && !to.meta.requiresAdmin) return true

  // Dynamic import to avoid circular dependency
  const { useAuth } = await import('@/composables/useAuth')
  const { isAuthenticated, isAdmin, loading } = useAuth()

  // Wait for auth to initialize
  if (loading.value) {
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (!loading.value) {
          clearInterval(check)
          resolve()
        }
      }, 50)
    })
  }

  if (!isAuthenticated.value) {
    return { name: 'AdminLogin', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !isAdmin.value) {
    return { name: 'AdminClock' }
  }

  return true
})

export default router
