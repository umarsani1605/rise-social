<script setup>
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoginRegisterDialog from '@/components/auth/LoginRegisterDialog.vue';

const route = useRoute();

// @sidebase/nuxt-auth composables
const { data: session, status, signOut } = useAuth();

// Computed properties dari session data
const user = computed(() => session.value?.user || null);
const isAuthenticated = computed(() => status.value === 'authenticated');
const fullName = computed(() => {
  if (!user.value) return '';
  return `${user.value.firstName} ${user.value.lastName}`.trim();
});
const initials = computed(() => {
  if (!user.value) return 'U';
  const first = user.value.firstName?.[0] || '';
  const last = user.value.lastName?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'U';
});

const mobileMenuOpen = ref(false);
const isScrolled = ref(false);
const showLoginDialog = ref(false);

const navigationMenus = computed(() => [
  {
    id: 'home',
    name: 'Home',
    path: '/',
    isActive: route.path === '/',
  },
  {
    id: 'courses',
    name: 'Courses',
    path: '/courses',
    isActive: route.path.startsWith('/courses'),
  },
  {
    id: 'opportunities',
    name: 'Jobs',
    path: '/opportunities',
    isActive: route.path.startsWith('/opportunities'),
  },
  {
    id: 'programs',
    name: 'Programs',
    path: '/programs',
    isActive: route.path.startsWith('/programs'),
  },
  {
    id: 'about-us',
    name: 'About Us',
    path: '/about-us',
    isActive: route.path.startsWith('/about-us'),
  },
  {
    id: 'contact',
    name: 'Contact Us',
    path: '/contact',
    isActive: route.path.startsWith('/contact'),
  },
]);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const openLoginDialog = () => {
  showLoginDialog.value = true;
  mobileMenuOpen.value = false; // Close mobile menu when opening dialog
};

const handleLogout = async () => {
  signOut();
  mobileMenuOpen.value = false;
  await navigateTo('/');
};

// Handle scroll detection
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
};

// Watch for route changes to close mobile menu
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false;
  }
);

// Close mobile menu when clicking outside and setup scroll listener
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('header')) {
      mobileMenuOpen.value = false;
    }
  });

  // Add scroll listener
  window.addEventListener('scroll', handleScroll);

  // Check initial scroll position
  handleScroll();
});

// Clean up scroll listener
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="relative">
    <header :class="['fixed w-full top-0 z-50 bg-[#062d2c] transition-shadow duration-300', isScrolled ? 'shadow-md' : '']">
      <div class="container-wrapper">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <NuxtLink to="/" class="flex items-center">
              <NuxtImg src="/images/logo.png" alt="Rise Social" class="h-8 w-auto" loading="eager" format="webp" />
            </NuxtLink>
          </div>

          <!-- Desktop Navigation Menu -->
          <nav class="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem v-for="menu in navigationMenus" :key="menu.id">
                  <NuxtLink :to="menu.path" :class="navigationMenuTriggerStyle({ active: menu.isActive })">{{ menu.name }}</NuxtLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <!-- Desktop Auth Section -->
          <div class="relative hidden lg:flex items-center">
            <!-- Authenticated User -->
            <div v-if="isAuthenticated" class="flex items-center space-x-4 h-full py-4">
              <DropdownMenu :modal="false">
                <DropdownMenuTrigger class="h-full" as-child>
                  <Button variant="ghost" class="flex items-center p-2 text-white! hover:bg-white/5">
                    <Avatar class="size-8">
                      <AvatarImage :src="user?.avatar" />
                      <AvatarFallback>{{ initials }}</AvatarFallback>
                    </Avatar>
                    <span class="hidden sm:block text-sm">{{ fullName }}</span>
                    <Icon name="lucide:chevron-down" class="size-4 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-48">
                  <DropdownMenuItem @click="navigateTo('/dashboard')" class="cursor-pointer">
                    <Icon name="lucide:layout-dashboard" class="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="navigateTo('#')" class="cursor-pointer">
                    <Icon name="lucide:settings" class="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="handleLogout" class="cursor-pointer text-red-600">
                    <Icon name="lucide:log-out" class="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <!-- Not Authenticated -->
            <Button v-else @click="openLoginDialog" class="bg-transparent! hover:bg-white/5! text-white">
              <Icon name="lucide:user" class="size-4!" />
              Login / Register
            </Button>
          </div>

          <!-- Mobile menu button -->
          <div class="lg:hidden flex items-center space-x-2">
            <Button variant="ghost" size="icon" @click="toggleMobileMenu">
              <Icon name="lucide:menu" class="size-6! bg-white!" />
            </Button>
          </div>
        </div>
      </div>
      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-300"
        leave-active-class="transition-all duration-300"
        enter-from-class="opacity-0 -translate-y-4"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="mobileMenuOpen" class="lg:hidden absolute top-full left-0 right-0 bg-secondary text-white backdrop-blur-sm shadow-lg z-40">
          <div class="container-wrapper py-4 space-y-2">
            <!-- Mobile Navigation Links -->
            <NuxtLink v-for="menu in navigationMenus" :key="menu.id" :to="menu.path" class="navbar-mobile-link">
              <span :class="menu.isActive ? 'navbar-mobile-link-active' : 'navbar-mobile-link-inactive'">
                {{ menu.name }}
              </span>
            </NuxtLink>

            <!-- Mobile Auth Section -->
            <div class="pt-4">
              <!-- Authenticated User -->
              <div v-if="isAuthenticated" class="space-y-2">
                <div class="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                  <Avatar class="h-10 w-10">
                    <AvatarImage :src="user?.avatar" />
                    <AvatarFallback class="text-sm">{{ initials }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="text-sm font-medium text-white">{{ fullName }}</p>
                    <p class="text-xs text-gray-300">{{ user?.email }}</p>
                  </div>
                </div>
                <Button @click="navigateTo('/dashboard')" variant="ghost" class="w-full justify-start text-white">
                  <Icon name="lucide:layout-dashboard" class="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button @click="handleLogout" variant="ghost" class="w-full justify-start text-red-300 hover:text-red-200">
                  <Icon name="lucide:log-out" class="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>

              <!-- Not Authenticated -->
              <Button v-else @click="openLoginDialog" class="w-full justify-center">
                <Icon name="lucide:user" class="mr-2 h-4 w-4" />
                Login / Register
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Login/Register Dialog -->
    <LoginRegisterDialog :open="showLoginDialog" @update:open="showLoginDialog = $event" />
  </div>
</template>
