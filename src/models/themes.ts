export interface ThemeDefinition {
    label: string
    dot: string   // Tailwind class for the color swatch dot
    vars: Record<string, string>
}

export const themes = {
    blue: {
        label: 'Blue',
        dot: 'bg-blue-500',
        vars: {
            '--theme-50':  'oklch(0.97  0.013 236.62)',
            '--theme-100': 'oklch(0.932 0.032 255.585)',
            '--theme-200': 'oklch(0.882 0.059 254.128)',
            '--theme-300': 'oklch(0.809 0.105 251.813)',
            '--theme-400': 'oklch(0.707 0.165 254.624)',
            '--theme-500': 'oklch(0.623 0.214 259.815)',
            '--theme-600': 'oklch(0.546 0.245 262.881)',
            '--theme-700': 'oklch(0.488 0.243 264.376)',
            '--theme-800': 'oklch(0.424 0.199 265.638)',
            '--theme-900': 'oklch(0.379 0.146 265.522)',
            '--theme-950': 'oklch(0.282 0.091 267.935)',
        },
    },
    indigo: {
        label: 'Indigo',
        dot: 'bg-indigo-500',
        vars: {
            '--theme-50':  'oklch(0.962 0.018 272.314)',
            '--theme-100': 'oklch(0.93  0.034 272.788)',
            '--theme-200': 'oklch(0.87  0.065 274.039)',
            '--theme-300': 'oklch(0.785 0.115 274.713)',
            '--theme-400': 'oklch(0.673 0.182 276.935)',
            '--theme-500': 'oklch(0.585 0.233 277.117)',
            '--theme-600': 'oklch(0.511 0.262 276.966)',
            '--theme-700': 'oklch(0.457 0.24  277.023)',
            '--theme-800': 'oklch(0.398 0.195 277.366)',
            '--theme-900': 'oklch(0.359 0.144 278.697)',
            '--theme-950': 'oklch(0.257 0.09  281.288)',
        },
    },
    violet: {
        label: 'Violet',
        dot: 'bg-violet-500',
        vars: {
            '--theme-50':  'oklch(0.969 0.016 293.756)',
            '--theme-100': 'oklch(0.943 0.029 294.588)',
            '--theme-200': 'oklch(0.894 0.057 293.283)',
            '--theme-300': 'oklch(0.811 0.111 293.572)',
            '--theme-400': 'oklch(0.702 0.183 293.541)',
            '--theme-500': 'oklch(0.606 0.25  292.717)',
            '--theme-600': 'oklch(0.541 0.281 293.009)',
            '--theme-700': 'oklch(0.491 0.27  292.581)',
            '--theme-800': 'oklch(0.432 0.232 292.759)',
            '--theme-900': 'oklch(0.38  0.189 293.745)',
            '--theme-950': 'oklch(0.283 0.141 291.089)',
        },
    },
    emerald: {
        label: 'Emerald',
        dot: 'bg-emerald-500',
        vars: {
            '--theme-50':  'oklch(0.979 0.021 166.113)',
            '--theme-100': 'oklch(0.95  0.052 163.051)',
            '--theme-200': 'oklch(0.905 0.093 164.15)',
            '--theme-300': 'oklch(0.845 0.143 164.978)',
            '--theme-400': 'oklch(0.765 0.177 163.223)',
            '--theme-500': 'oklch(0.696 0.17  162.48)',
            '--theme-600': 'oklch(0.596 0.145 163.225)',
            '--theme-700': 'oklch(0.508 0.118 165.612)',
            '--theme-800': 'oklch(0.432 0.095 166.913)',
            '--theme-900': 'oklch(0.378 0.077 168.94)',
            '--theme-950': 'oklch(0.262 0.051 172.552)',
        },
    },
    rose: {
        label: 'Rose',
        dot: 'bg-rose-500',
        vars: {
            '--theme-50':  'oklch(0.969 0.015 12.422)',
            '--theme-100': 'oklch(0.941 0.03  12.58)',
            '--theme-200': 'oklch(0.892 0.058 10.001)',
            '--theme-300': 'oklch(0.81  0.117 11.638)',
            '--theme-400': 'oklch(0.712 0.194 13.428)',
            '--theme-500': 'oklch(0.645 0.246 16.439)',
            '--theme-600': 'oklch(0.586 0.253 17.585)',
            '--theme-700': 'oklch(0.514 0.222 16.935)',
            '--theme-800': 'oklch(0.455 0.188 13.697)',
            '--theme-900': 'oklch(0.41  0.159 10.272)',
            '--theme-950': 'oklch(0.271 0.105 12.094)',
        },
    },
    teal: {
        label: 'Teal',
        dot: 'bg-teal-500',
        vars: {
            '--theme-50':  'oklch(0.984 0.014 180.72)',
            '--theme-100': 'oklch(0.953 0.051 180.801)',
            '--theme-200': 'oklch(0.91  0.096 180.426)',
            '--theme-300': 'oklch(0.855 0.138 181.071)',
            '--theme-400': 'oklch(0.777 0.152 181.912)',
            '--theme-500': 'oklch(0.704 0.14  182.503)',
            '--theme-600': 'oklch(0.6   0.118 184.704)',
            '--theme-700': 'oklch(0.511 0.096 186.391)',
            '--theme-800': 'oklch(0.437 0.078 188.216)',
            '--theme-900': 'oklch(0.386 0.063 188.416)',
            '--theme-950': 'oklch(0.277 0.046 192.524)',
        },
    },
} satisfies Record<string, ThemeDefinition>

export type Theme = keyof typeof themes
