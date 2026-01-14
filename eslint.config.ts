import antfu from '@antfu/eslint-config'
import { tanstackConfig } from '@tanstack/eslint-config'


export default antfu({
  react: true
},
  [...tanstackConfig]
)
