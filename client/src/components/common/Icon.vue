<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="['icon', `icon-${name}`]"
    :style="{ color }"
  >
    <defs v-if="name === 'logo'">
      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(135)">
        <stop offset="0%" stop-color="#db5353"/>
        <stop offset="50%" stop-color="#ffb84a"/>
        <stop offset="100%" stop-color="#d9b30f"/>
      </linearGradient>
      
      <radialGradient id="glassEffect" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="white" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </radialGradient>
    </defs>
    
    <g v-if="name === 'logo'" transform="translate(0, 0)"><circle cx="12" cy="12" r="9" fill="none" stroke="url(#gradient2)" stroke-width="2.5" data-v-ded1a3ac="">
    </circle><circle cx="15" cy="15" r="10" fill="url(#glassEffect)" data-v-ded1a3ac="">
    </circle><rect x="10" y="18" width="8" height="3" rx="1.5" fill="url(#gradient2)" transform="rotate(45 20 20)" data-v-ded1a3ac="">
    </rect><g transform="translate(10, 10) scale(0.35)" data-v-ded1a3ac="">
      <line x1="0" y1="-10" x2="0" y2="10" stroke="#db5353" stroke-width="1.8" stroke-linecap="round" data-v-ded1a3ac=""></line>
      <line x1="-10" y1="0" x2="10" y2="0" stroke="#ffb84a" stroke-width="1.8" stroke-linecap="round" data-v-ded1a3ac=""></line>
      <line x1="-7" y1="-7" x2="7" y2="7" stroke="#d9b30f" stroke-width="1.8" stroke-linecap="round" data-v-ded1a3ac=""></line>
      <line x1="-7" y1="7" x2="7" y2="-7" stroke="#ffb84a" stroke-width="1.8" stroke-linecap="round" data-v-ded1a3ac=""></line>
      <circle cx="0" cy="0" r="3.5" fill="#db5353" data-v-ded1a3ac=""></circle></g>
    </g>

    <path 
      v-else-if="name === 'arrow-up'"
      d="M10 4.16669V15.8334M10 4.16669L4.16669 10M10 4.16669L15.8334 10" 
      stroke="currentColor" 
      stroke-width="1.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <path 
      v-else-if="name === 'arrow-down'"
      d="M10 15.8334V4.16669M10 15.8334L4.16669 10M10 15.8334L15.8334 10" 
      stroke="currentColor" 
      stroke-width="1.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <path 
      v-else-if="name === 'arrow-left'"
      d="M15.8334 10H4.16669M4.16669 10L10 15.8334M4.16669 10L10 4.16669" 
      stroke="currentColor" 
      stroke-width="1.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <path 
      v-else-if="name === 'close'"
      d="M12 4L4 12M4 4L12 12" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round"
    />

    <g v-else-if="name === 'check'">
      <path 
        d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M22 4L12 14.01L9 11.01" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </g>

    <g v-else-if="name === 'error'">
      <path 
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M15 9L9 15M9 9L15 15" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </g>

    <path 
      v-else-if="name === 'warning'"
      d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <g v-else-if="name === 'user'">
      <path 
        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </g>

    <g v-else-if="name === 'bell'">
      <path 
        d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </g>

    <path 
      v-else-if="name === 'search'"
      d="M14 14L10.5355 10.5355M10.5355 10.5355C11.4731 9.59785 12 8.32608 12 7C12 5.67392 11.4731 4.40215 10.5355 3.46447C9.59785 2.52678 8.32608 2 7 2C5.67392 2 4.40215 2.52678 3.46447 3.46447C2.52678 4.40215 2 5.67392 2 7C2 8.32608 2.52678 9.59785 3.46447 10.5355C4.40215 11.4731 5.67392 12 7 12C8.32608 12 9.59785 11.4731 10.5355 10.5355Z" 
      stroke="currentColor" 
      stroke-width="1.5" 
      stroke-linecap="round"
    />

    <path 
      v-else-if="name === 'chevron-down'"
      d="M4 6L8 10L12 6" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <g v-else-if="name === 'logout'">
      <path 
        d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" 
        stroke="currentColor" 
        stroke-width="1.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M10.6667 11.3333L14 8L10.6667 4.66667" 
        stroke="currentColor" 
        stroke-width="1.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M14 8H6" 
        stroke="currentColor" 
        stroke-width="1.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </g>

    <path 
      v-else-if="name === 'security'"
      d="M12 15V17M12 22C8.13401 22 5 18.866 5 15V10C5 6.13401 8.13401 3 12 3C15.866 3 19 6.13401 19 10V15C19 18.866 15.866 22 12 22Z" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <path 
      v-else-if="name === 'roles'"
      d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21L21 21M19 21H14M5 21L3 21M5 21H10M9 7H10M9 11H10M14 7H15M14 11H15M10 21V17C10 16.4477 10.4477 16 11 16H13C13.5523 16 14 16.4477 14 17V21M10 21H14" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <g v-else-if="name === 'email'">
      <path 
        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M22 6L12 13L2 6" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </g>

     <g v-else-if="name === 'calendar'">
        <path 
        d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
     </g>

    <path 
      v-else-if="name === 'clock'"
      d="M12 6V12L16 14M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <path 
      v-else-if="name === 'edit'"
      d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12M15.5 3.5C15.8978 3.10217 16.4374 2.87868 17 2.87868C17.5626 2.87868 18.1022 3.10217 18.5 3.5C18.8978 3.89782 19.1213 4.43739 19.1213 5C19.1213 5.56261 18.8978 6.10217 18.5 6.5L9 16L5 17L6 13L15.5 3.5Z" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <path 
      v-else-if="name === 'login'"
      d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <path 
      v-else-if="name === 'users'"
      d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7ZM21 10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 8.89543 17.8954 8 19 8C20.1046 8 21 8.89543 21 10ZM3 10C3 11.1046 3.89543 12 5 12C6.10457 12 7 11.1046 7 10C7 8.89543 6.10457 8 5 8C3.89543 8 3 8.89543 3 10Z" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <path 
      v-else-if="name === 'plus'"
      d="M10 4V16M4 10H16" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <g v-else-if="name === 'database'">
      <path 
        d="M12 8C16.9706 8 21 6.65685 21 5C21 3.34315 16.9706 2 12 2C7.02944 2 3 3.34315 3 5C3 6.65685 7.02944 8 12 8Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M21 12C21 13.66 17 15 12 15C7 15 3 13.66 3 12" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M3 5V19C3 20.66 7 22 12 22C17 22 21 20.66 21 19V5" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
     </g> 

    <path 
      v-else-if="name === 'chart'"
      d="M18 20V10M12 20V4M6 20V14" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

     <g v-else-if="name === 'refresh'">
      <path 
        d="M1 4V10H7" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M23 20V14H17" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 14 3.22M3.51 15C4.0172 16.4332 4.87907 17.7146 6.01547 18.7246C7.15186 19.7346 8.5255 20.4402 10 20.78" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
     </g>

    <g  v-else-if="name === 'trash'">
      <path d="M5 7H19L18 21H6L5 7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M9 10V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M15 10V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M3 7H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M10 3H14L15 7H9L10 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </g>

    <path 
      v-else-if="name === 'file'"
      d="M6.66669 3.33331H13.3334L15.8334 5.83331V15.8334H4.16669V3.33331H6.66669ZM6.66669 3.33331V5.83331H15" 
      stroke="currentColor" 
      stroke-width="1.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <path 
      v-else-if="name === 'upload'"
      d="M10 4.16669V11.6667M10 4.16669L6.66669 7.5M10 4.16669L13.3334 7.5M5 15H15" 
      stroke="currentColor" 
      stroke-width="1.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <g v-else>
      <path 
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => [
      'logo',
      'arrow-up',
      'arrow-down',
      'arrow-left',
      'close',
      'check',
      'error',
      'user',
      'users',
      'bell',
      'search',
      'chevron-down',
      'logout',
      'security',
      'roles',
      'email',
      'warning',
      'calendar', 
      'clock', 
      'edit',
      'plus',
      'login', 
      'database', 
      'chart', 
      'refresh',
      'trash',
      'file',
      'upload'
    ].includes(value)
  },
  size: {
    type: [String, Number],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  }
});
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>