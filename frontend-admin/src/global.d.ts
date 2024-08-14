
export {}

declare global {
  export interface Window {
    detectLang?: (text: string) => [string, number][]
  }
}
