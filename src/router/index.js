import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const SITE_URL = 'https://vrspace.co.ke'
const DEFAULT_TITLE = 'VR Space - Immersive Virtual Reality Experience in Nairobi'
const DEFAULT_DESCRIPTION =
  'Discover unparalleled virtual reality gaming experiences at VR SPACE. HTC Vive, EggVR, GT Racing, PS5 games and more in Nairobi, Kenya.'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public routes ──
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/About.vue'),
      meta: {
        title: 'About Us | VR Space Nairobi',
        description: 'VR Space is a virtual reality gaming venue at The Waterfront Karen, Nairobi, with HTC Vive, Meta Quest, racing simulators and consoles for all ages.'
      }
    },
    {
      path: '/experiences',
      name: 'Experiences',
      component: () => import('@/views/Experiences.vue'),
      meta: {
        title: 'VR Experiences & Prices | VR Space Nairobi',
        description: 'HTC Vive VR, Egg Rollercoaster VR, GT Racing Simulator, Meta Quest, PlayStation 5 and Nintendo Switch at VR Space, The Waterfront Karen. Sessions from KES 500, walk-ins welcome.'
      }
    },
    {
      path: '/marketplace',
      name: 'Marketplace',
      component: () => import('@/views/Marketplace.vue'),
      meta: {
        title: 'Buy Meta Quest VR Headsets in Kenya | VR Space Marketplace',
        description: 'Order Meta Quest 3 and Meta Quest 3S VR headsets in Kenya from VR Space.'
      }
    },
    {
      path: '/contact',
      name: 'Contact',
      component: () => import('@/views/Contact.vue'),
      meta: {
        title: 'Contact & Directions | VR Space Nairobi',
        description: 'Find VR Space at The Waterfront Karen (Basement), Nairobi. Call or WhatsApp +254 729 054 607. Open daily, walk-ins welcome.'
      }
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
          path: 'machines/report',
          name: 'AdminMachinesReport',
          component: () => import('@/views/admin/machines/MachinesReport.vue'),
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
          path: 'employees/:id/edit',
          name: 'AdminEmployeeEdit',
          component: () => import('@/views/admin/employees/EmployeeForm.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'partner-staff',
          name: 'AdminPartnerStaff',
          component: () => import('@/views/admin/partner-staff/PartnerStaffList.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'partner-staff/report',
          name: 'AdminPartnerStaffReport',
          component: () => import('@/views/admin/partner-staff/PartnerStaffReport.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'tiktok',
          name: 'AdminTiktok',
          component: () => import('@/views/admin/tiktok/TiktokVideos.vue'),
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
          path: 'finance/report',
          name: 'AdminFinanceReport',
          component: () => import('@/views/admin/finance/FinanceReport.vue'),
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

    // ── Not found ──
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: { title: 'Page not found | VR Space', noindex: true }
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

// ── Per-page title, description and link-preview tags ──
function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta')
    const [, key, name] = selector.match(/\[(\w+)="([^"]+)"\]/)
    el.setAttribute(key, name)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

router.afterEach((to) => {
  if (to.meta.isAdmin || to.path.startsWith('/admin')) {
    document.title = 'VRSpace Staff Portal'
    return
  }
  const title = to.meta.title || DEFAULT_TITLE
  const description = to.meta.description || DEFAULT_DESCRIPTION
  const url = SITE_URL + (to.path === '/' ? '/' : to.path)

  document.title = title
  setMeta('meta[name="description"]', 'content', description)
  setMeta('meta[property="og:title"]', 'content', title)
  setMeta('meta[property="og:description"]', 'content', description)
  setMeta('meta[property="og:url"]', 'content', url)
  setMeta('link[rel="canonical"]', 'href', url)
  setMeta('meta[name="robots"]', 'content', to.meta.noindex ? 'noindex' : 'index, follow')
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
