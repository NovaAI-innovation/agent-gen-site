import '../styles/fonts.css'
import '../styles/tokens.css'
import '../styles/global.css'
import {initTheme} from './theme'
import {initCopy} from './copy'

initTheme()
initCopy()
if (document.getElementById('agent-graph')) import('./graph-anim').then((m) => m.initGraph())
