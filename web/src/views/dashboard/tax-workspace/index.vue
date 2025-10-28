<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { WorkbenchHeader, WorkbenchProject } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { Button, Calendar, Space } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

const userStore = useUserStore();
const router = useRouter();

// View toggle state
const isTableView = ref(false);

function toggleView() {
  isTableView.value = !isTableView.value;
}

// Calendar data
const selectedDate = ref<Dayjs>(dayjs());
const calendarMode = ref<'day' | 'list' | 'month' | 'week'>('month');

// Calendar events data
interface CalendarEvent {
  allDay?: boolean;
  color: string;
  date: string;
  id: string;
  time?: string;
  title: string;
  type: 'deadline' | 'meeting' | 'review' | 'task';
  priority?: 'high' | 'medium' | 'low';
  description?: string;
}

// Enhanced calendar events with better tax-related content
const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Tax Return Review - ROC Group',
    date: '2025-01-14',
    time: '10:00 AM - 12:00 PM',
    type: 'review',
    color: 'bg-blue-500',
    priority: 'high',
    description: 'Final review of quarterly tax returns',
  },
  {
    id: '2',
    title: 'Client Meeting - Falcon Group',
    date: '2025-01-15',
    time: '2:00 PM - 3:30 PM',
    type: 'meeting',
    color: 'bg-green-500',
    priority: 'medium',
    description: 'Tax planning consultation',
  },
  {
    id: '3',
    title: 'Tax Filing Deadline',
    date: '2025-01-17',
    type: 'deadline',
    color: 'bg-red-500',
    priority: 'high',
    allDay: true,
    description: 'Q4 corporate tax filing deadline',
  },
  {
    id: '4',
    title: 'Vtech Group Consultation',
    date: '2025-01-17',
    time: '9:00 AM - 11:00 AM',
    type: 'meeting',
    color: 'bg-purple-500',
    priority: 'medium',
    description: 'Technology sector tax advisory',
  },
  {
    id: '5',
    title: 'Document Preparation',
    date: '2025-01-18',
    time: '1:00 PM - 4:00 PM',
    type: 'task',
    color: 'bg-orange-500',
    priority: 'medium',
    description: 'Prepare tax documents for InstaFoodie Group',
  },
  {
    id: '6',
    title: 'Compliance Audit',
    date: '2025-01-20',
    time: '10:00 AM - 5:00 PM',
    type: 'review',
    color: 'bg-indigo-500',
    priority: 'high',
    description: 'Annual compliance audit for Dojo Group',
  },
  {
    id: '7',
    title: 'Tax Strategy Workshop',
    date: '2025-01-22',
    time: '2:00 PM - 4:00 PM',
    type: 'meeting',
    color: 'bg-teal-500',
    priority: 'low',
    description: 'Internal team workshop on new tax strategies',
  },
];

function onCalendarSelect(date: Dayjs) {
  selectedDate.value = date;
}

function setCalendarMode(mode: 'day' | 'list' | 'month' | 'week') {
  calendarMode.value = mode;
}

function getEventsForDate(date: string) {
  return calendarEvents.filter((event) => event.date === date);
}

function getEventsByDay() {
  const eventsByDay: Record<string, CalendarEvent[]> = {};
  calendarEvents.forEach((event) => {
    if (!eventsByDay[event.date]) {
      eventsByDay[event.date] = [];
    }
    eventsByDay[event.date]!.push(event);
  });
  return eventsByDay;
}

// My Projects Data
const projectItems: WorkbenchProjectItem[] = [
  {
    content:
      'ROC Group tax compliance and filing project with comprehensive documentation.',
    date: '2024-11-01',
    group: 'ROC Group',
    icon: 'ion:business-outline',
    title: 'ROC Group',
    url: '/projects/roc-group',
  },
  {
    content: 'Falcon Group quarterly tax planning and optimization strategies.',
    date: '2024-11-01',
    group: 'Falcon Group',
    icon: 'ion:airplane-outline',
    title: 'Falcon Group',
    url: '/projects/falcon-group',
  },
  {
    content:
      'Vtech Group technology sector tax advisory and compliance services.',
    date: '2024-11-01',
    group: 'Vtech Group',
    icon: 'ion:hardware-chip-outline',
    title: 'Vtech Group',
    url: '/projects/vtech-group',
  },
  {
    content: 'InstaFoodie Group restaurant chain tax management and reporting.',
    date: '2024-11-01',
    group: 'InstaFoodie Group',
    icon: 'ion:restaurant-outline',
    title: 'InstaFoodie Group',
    url: '/projects/instafoodie-group',
  },
  {
    content: 'Dojo Group martial arts business tax planning and compliance.',
    date: '2024-11-01',
    group: 'Dojo Group',
    icon: 'ion:fitness-outline',
    title: 'Dojo Group',
    url: '/projects/dojo-group',
  },
];

// Activity Timeline Data
const trendItems: WorkbenchTrendItem[] = [
  {
    avatar: 'svg:avatar-1',
    content: `Completed processing <a>12 tax returns</a> for client submissions`,
    date: '12 minutes ago',
    title: 'Tax Specialist',
  },
  {
    avatar: 'svg:avatar-2',
    content: `Conducted tax consultation meeting with client <a>John Smith</a>`,
    date: '45 minutes ago',
    title: 'Accountant',
  },
  {
    avatar: 'svg:avatar-3',
    content: `Created new <a>client profile</a> and assigned 6 team members`,
    date: '2 days ago',
    title: 'Project Manager',
  },
  {
    avatar: 'svg:avatar-4',
    content: `Updated <a>tax calculator</a> functionality module`,
    date: '3 days ago',
    title: 'Developer',
  },
  {
    avatar: 'svg:avatar-1',
    content: `Handled client consultation regarding <a>tax optimization</a>`,
    date: '1 week ago',
    title: 'Tax Advisor',
  },
];

function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}

// Table configuration for projects
interface ProjectTableRow {
  content: string;
  date: string;
  group: string;
  icon: string;
  title: string;
  url: string;
}

const [Grid] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { title: 'Project', field: 'title', width: 150 },
      { title: 'Group', field: 'group', width: 150 },
      {
        title: 'Description',
        field: 'content',
        showOverflow: true,
        minWidth: 300,
      },
      { title: 'Date', field: 'date', width: 120 },
      {
        title: 'Actions',
        width: 100,
        slots: { default: 'action' },
      },
    ],
    data: projectItems,
    height: 400,
    maxHeight: 500,
    keepSource: true,
    resizable: false,
    border: true,
    stripe: true,
    showOverflow: true,
    scrollY: {
      enabled: true,
      gt: 0,
    },
    rowConfig: {
      keyField: 'title',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
    pagerConfig: {
      enabled: false,
    },
  } as VxeTableGridOptions<ProjectTableRow>,
});
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
        <template #title> Welcome to Tax Management Workspace </template>
        <template #description>
        Efficiently manage your tax operations through our comprehensive
        dashboard
      </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col gap-5 lg:flex-row">
      <!-- Left Column: Activity Timeline -->
      <div class="w-full lg:w-1/2">
        <div class="bg-card flex h-[600px] flex-col rounded-lg border p-4">
          <h3 class="mb-4 text-lg font-semibold">Activity Timeline</h3>
          <div class="relative flex-1 overflow-hidden">
            <!-- Vertical Timeline Line -->
            <div class="bg-border absolute bottom-0 left-4 top-0 w-0.5"></div>

            <!-- Timeline Items -->
            <div class="h-full space-y-6 overflow-y-auto pr-2">
              <div
                v-for="(item, index) in trendItems"
                :key="index"
                class="relative flex items-start gap-4"
              >
                <!-- Timeline Dot -->
                <div
                  class="border-primary bg-background relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2"
                >
                  <div class="bg-primary h-2 w-2 rounded-full"></div>
                </div>

                <!-- Content -->
                <div class="flex-1 pb-4">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">{{ item.title }}</span>
                    <span class="text-muted-foreground text-xs">{{
                      item.date
                    }}</span>
                  </div>
                  <p
                    class="text-muted-foreground mt-1 text-sm"
                    v-html="item.content"
                  ></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Enhanced Calendar -->
      <div class="w-full lg:w-1/2">
        <div
          class="bg-card flex h-[600px] flex-col rounded-lg border p-4 shadow-sm"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-foreground text-lg font-semibold">Calendar</h3>
            <div class="flex gap-1 rounded-lg border p-1">
              <Button
                :type="calendarMode === 'month' ? 'primary' : 'text'"
                size="small"
                @click="setCalendarMode('month')"
                class="px-3 py-1 text-xs font-medium transition-all duration-200"
              >
                Month
              </Button>
              <Button
                :type="calendarMode === 'week' ? 'primary' : 'text'"
                size="small"
                @click="setCalendarMode('week')"
                class="px-3 py-1 text-xs font-medium transition-all duration-200"
              >
                Week
              </Button>
              <Button
                :type="calendarMode === 'day' ? 'primary' : 'text'"
                size="small"
                @click="setCalendarMode('day')"
                class="px-3 py-1 text-xs font-medium transition-all duration-200"
              >
                Day
              </Button>
              <Button
                :type="calendarMode === 'list' ? 'primary' : 'text'"
                size="small"
                @click="setCalendarMode('list')"
                class="px-3 py-1 text-xs font-medium transition-all duration-200"
              >
                List
              </Button>
            </div>
          </div>

          <!-- Calendar View -->
          <div v-if="calendarMode !== 'list'" class="mb-6 flex flex-1 flex-col">
            <Calendar
              :value="selectedDate"
              @select="onCalendarSelect"
              class="w-full flex-1 rounded-lg border shadow-sm calendar-enhanced"
              :mode="calendarMode === 'list' ? 'month' : calendarMode"
              :fullscreen="false"
            >
              <template #dateCellRender="{ current }">
                <div class="relative h-full min-h-[80px] p-1">
                  <div class="space-y-0.5">
                    <div
                      v-for="(event, index) in getEventsForDate(
                        current.format('YYYY-MM-DD'),
                      ).slice(0, 3)"
                      :key="`${current.format('YYYY-MM-DD')}-${event.id || index}`"
                      :class="[
                        'h-1.5 w-full rounded-full text-xs truncate transition-all duration-200 hover:h-4 hover:px-1 hover:text-white hover:font-medium cursor-pointer',
                        event.color,
                        event.priority === 'high' ? 'ring-1 ring-red-300' : '',
                        event.priority === 'medium' ? 'ring-1 ring-yellow-300' : '',
                      ]"
                      :title="`${event.title} ${event.time ? '- ' + event.time : ''}`"
                    >
                      <span class="opacity-0 hover:opacity-100 transition-opacity duration-200 text-[10px] leading-none">
                        {{ event.title.slice(0, 15) }}{{ event.title.length > 15 ? '...' : '' }}
                      </span>
                    </div>
                    <div
                      v-if="getEventsForDate(current.format('YYYY-MM-DD')).length > 3"
                      class="absolute right-1 top-1 h-3 w-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                      :title="`+${getEventsForDate(current.format('YYYY-MM-DD')).length - 3} more events`"
                    >
                      <span class="text-white text-[8px] font-bold">
                        +{{ getEventsForDate(current.format('YYYY-MM-DD')).length - 3 }}
                      </span>
                    </div>
                  </div>
                  <!-- Today indicator -->
                  <div
                    v-if="current.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')"
                    class="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"
                  ></div>
                </div>
              </template>
            </Calendar>
          </div>

          <!-- List View -->
          <div v-else class="flex h-full max-h-[520px] flex-col">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-foreground text-lg font-semibold">
                  Upcoming Events
                </span>
                <div class="flex gap-1">
                  <div class="h-2 w-2 bg-red-500 rounded-full" title="High Priority"></div>
                  <div class="h-2 w-2 bg-yellow-500 rounded-full" title="Medium Priority"></div>
                  <div class="h-2 w-2 bg-green-500 rounded-full" title="Low Priority"></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  size="small"
                  type="text"
                  class="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
                  @click="selectedDate = selectedDate.subtract(1, 'month')"
                >
                  <span
                    class="iconify text-gray-600"
                    data-icon="ion:chevron-back-outline"
                  ></span>
                </Button>
                <span
                  class="text-muted-foreground min-w-[120px] px-3 py-1 text-center text-sm font-medium bg-gray-50 rounded-md"
                >
                  {{ selectedDate.format('MMMM YYYY') }}
                </span>
                <Button
                  size="small"
                  type="text"
                  class="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
                  @click="selectedDate = selectedDate.add(1, 'month')"
                >
                  <span
                    class="iconify text-gray-600"
                    data-icon="ion:chevron-forward-outline"
                  ></span>
                </Button>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto">
              <div class="space-y-4 pr-2">
                <div
                  v-for="(events, date) in getEventsByDay()"
                  :key="date"
                  class="group"
                >
                  <div
                    class="border-border/50 hover:border-border rounded-xl border p-5 transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-white to-gray-50"
                  >
                    <h4
                      class="text-foreground border-border/30 mb-4 border-b pb-3 font-semibold text-base flex items-center gap-2"
                    >
                      <span class="iconify text-blue-500" data-icon="ion:calendar-outline"></span>
                      {{ dayjs(date).format('MMMM DD, YYYY') }}
                      <span class="text-muted-foreground ml-2 text-sm font-normal bg-blue-50 px-2 py-1 rounded-full">
                        {{ dayjs(date).format('dddd') }}
                      </span>
                      <span class="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {{ events.length }} event{{ events.length > 1 ? 's' : '' }}
                      </span>
                    </h4>

                    <div class="space-y-3">
                      <div
                        v-for="event in events"
                        :key="event.id"
                        class="border-border/30 hover:border-border/60 flex items-start gap-4 rounded-lg border p-4 transition-all duration-300 hover:shadow-md bg-white hover:bg-gray-50 group/event"
                      >
                        <!-- Event color indicator -->
                        <div
                          :class="[
                            'h-12 w-1.5 flex-shrink-0 rounded-full',
                            event.color,
                            'group-hover/event:w-2 transition-all duration-200'
                          ]"
                        ></div>

                        <!-- Event content -->
                        <div class="min-w-0 flex-1">
                          <div class="flex items-start justify-between gap-2">
                            <div class="text-foreground font-semibold text-base leading-tight">
                              {{ event.title }}
                            </div>
                            <!-- Priority indicator -->
                            <div
                              v-if="event.priority"
                              :class="[
                                'flex-shrink-0 h-2 w-2 rounded-full',
                                event.priority === 'high' ? 'bg-red-500' : '',
                                event.priority === 'medium' ? 'bg-yellow-500' : '',
                                event.priority === 'low' ? 'bg-green-500' : ''
                              ]"
                              :title="`${event.priority} priority`"
                            ></div>
                          </div>

                          <!-- Event description -->
                          <div
                            v-if="event.description"
                            class="text-muted-foreground mt-1 text-sm leading-relaxed"
                          >
                            {{ event.description }}
                          </div>

                          <!-- Event time -->
                          <div class="mt-2 flex items-center gap-4">
                            <div
                              v-if="event.time"
                              class="text-muted-foreground text-sm flex items-center gap-1"
                            >
                              <span class="iconify" data-icon="ion:time-outline"></span>
                              {{ event.time }}
                            </div>
                            <div
                              v-else-if="event.allDay"
                              class="text-muted-foreground text-sm flex items-center gap-1"
                            >
                              <span class="iconify" data-icon="ion:infinite-outline"></span>
                              All day
                            </div>
                          </div>
                        </div>

                        <!-- Event type badge -->
                        <div
                          :class="[
                            'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                            event.type === 'deadline' ? 'bg-red-50 text-red-700 border-red-200' : '',
                            event.type === 'meeting' ? 'bg-blue-50 text-blue-700 border-blue-200' : '',
                            event.type === 'review' ? 'bg-purple-50 text-purple-700 border-purple-200' : '',
                            event.type === 'task' ? 'bg-green-50 text-green-700 border-green-200' : ''
                          ]"
                        >
                          <span class="iconify mr-1" :data-icon="
                            event.type === 'deadline' ? 'ion:alarm-outline' :
                            event.type === 'meeting' ? 'ion:people-outline' :
                            event.type === 'review' ? 'ion:checkmark-circle-outline' :
                            'ion:list-outline'
                          "></span>
                          {{ event.type }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Width: My Projects Section -->
    <div class="mt-5">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold">My Projects</h3>
        <Space>
          <Button
            :type="!isTableView ? 'primary' : 'default'"
            @click="toggleView"
            size="small"
          >
            <template #icon>
              <span class="iconify" data-icon="ion:grid-outline"></span>
            </template>
            Card View
          </Button>
          <Button
            :type="isTableView ? 'primary' : 'default'"
            @click="toggleView"
            size="small"
          >
            <template #icon>
              <span class="iconify" data-icon="ion:list-outline"></span>
            </template>
            Table View
          </Button>
        </Space>
      </div>

      <!-- Card View -->
      <div v-if="!isTableView">
        <WorkbenchProject :items="projectItems" title="" @click="navTo" />
      </div>

      <!-- Table View -->
      <div v-else class="rounded-lg border">
        <div class="h-[500px] overflow-hidden">
          <Grid>
            <template #action="{ row }">
              <Button type="link" size="small" @click="navTo(row)">
                View
              </Button>
            </template>
          </Grid>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


/* Event hover animations */
.event-indicator {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.event-indicator:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Priority pulse animation */
@keyframes priority-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.priority-high {
  animation: priority-pulse 2s infinite;
}

</style>
