export const ASCII_LOGO = `
 ██████╗██╗  ██╗██╗   ██╗ ██████╗██╗  ██╗██╗███████╗
██╔════╝██║  ██║██║   ██║██╔════╝██║ ██╔╝██║██╔════╝
██║     ███████║██║   ██║██║     █████╔╝ ██║███████╗
██║     ██╔══██║██║   ██║██║     ██╔═██╗ ██║╚════██║
╚██████╗██║  ██║╚██████╔╝╚██████╗██║  ██╗██║███████║
 ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝╚══════╝
    ██████╗ ██████╗ ██████╗ ███████╗    ██╗      █████╗ ██████╗ 
   ██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██║     ██╔══██╗██╔══██╗
   ██║     ██║   ██║██║  ██║█████╗      ██║     ███████║██████╔╝
   ██║     ██║   ██║██║  ██║██╔══╝      ██║     ██╔══██║██╔══██╗
   ╚██████╗╚██████╔╝██████╔╝███████╗    ███████╗██║  ██║██████╔╝
    ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚══════╝╚═╝  ╚═╝╚═════╝ 
`;

export const CYBER_SKULLS = `
         ██████╗██╗   ██╗██████╗ ███████╗██████╗ 
        ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
        ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
        ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
        ╚██████╗   ██║   ██████╔╝███████╗██║  ██║
         ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
        ████████╗███████╗██████╗ ███╗   ███╗
        ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
           ██║   █████╗  ██████╔╝██╔████╔██║
           ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║
           ██║   ███████╗██║  ██║██║ ╚═╝ ██║
           ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
`;

export const MATRIX_EFFECT = [
	"Wake up, Neo...",
	"The Matrix has you...",
	"Follow the white rabbit.",
	"There is no spoon.",
	"Welcome to the real world.",
];

export const BOOT_SEQUENCE = [
	"CHUCK-DOS Version 2.025 (C) 1995-2025 Chuck Industries",
	"640K RAM Available",
	"Extended Memory: 32768K",
	"",
	"AutoExec.bat executing...",
	"Loading CONFIG.SYS...",
	"Chuck's Code Laboratory initialized.",
	"",
	"Type 'HELP' for available commands.",
	"",
];

export const CAT_ASCII = ["     /\\_/\\  ", "    ( o.o ) ", "     > ^ <  "];

export const HACK_SEQUENCE = [
	"Bypassing firewall... [████████████] 100%",
	"Cracking encryption... [████████████] 100%",
	"Accessing mainframe... [████████████] 100%",
	"Downloading data... [████████████] 100%",
	"Covering tracks... [████████████] 100%",
	"HACK SUCCESSFUL - ACCESS GRANTED",
];

export const HELP_COMMANDS = [
	{ command: "HELP", description: "Show this help message" },
	{ command: "DIR", description: "List available projects" },
	{ command: "CLS", description: "Clear screen" },
	{ command: "VER", description: "Show system version" },
	{ command: "TIME", description: "Show current time" },
	{ command: "GRADIENT", description: "Launch gradient border lab" },
	{ command: "GLASS", description: "Launch SVG glass effects" },
	{ command: "MATRIX", description: "Enter the Matrix" },
	{ command: "HACK", description: "Initiate cyber sequence" },
	{ command: "NEON", description: "Toggle neon mode" },
	{ command: "SKULL", description: "Display cyber skulls" },
	{ command: "MEOW", description: "Summon bouncing cyber cats" },
	{ command: "ABOUT", description: "About this system" },
	{ command: "EXIT", description: "Shut down system" },
];

export const TECH_STACK = [
	"• React Router v7",
	"• TypeScript",
	"• Vite",
	"• Tailwind CSS",
];

export const DIRECTORY_LISTING = [
	"Directory of C:\\CHUCK\\PROJECTS",
	"",
	"GRADIENT.EXE    1,024 bytes  Gradient Border Laboratory",
	"GLASS.EXE       2,048 bytes  SVG Glass Effects Studio",
	"TERMINAL.EXE    4,096 bytes  This Terminal Interface",
	"",
	"        3 File(s)     7,168 bytes",
	"        0 Dir(s)    999,999 bytes free",
	"",
];

export const CAT_ANIMATION_STYLES = `
  @keyframes bounceCat {
    0% { 
      left: -100px; 
      transform: translateY(0px) rotate(0deg); 
    }
    25% { 
      transform: translateY(-30px) rotate(5deg); 
    }
    50% { 
      transform: translateY(0px) rotate(-5deg); 
    }
    75% { 
      transform: translateY(-20px) rotate(3deg); 
    }
    100% { 
      left: calc(100vw + 100px); 
      transform: translateY(0px) rotate(0deg); 
    }
  }
`;

export const CAT_ELEMENT_STYLES = `
  position: fixed;
  z-index: 1000;
  font-size: 12px;
  line-height: 1;
  pointer-events: none;
  left: -100px;
`;

export const CAT_HTML_TEMPLATE = `
  <div style="font-family: monospace; color: #00ff41; text-shadow: 0 0 10px #00ff41;">
    /\\_/\\<br>
   ( ^.^ )<br>
    > ^ <
  </div>
`;

// Animation timing constants
export const MATRIX_DELAY = 1000;
export const MATRIX_FINAL_DELAY = 500;
export const HACK_STEP_DELAY = 800;
export const HACK_COMPLETION_DELAY = 500;
export const CAT_SPAWN_DELAY = 800;
export const CAT_CLEANUP_DELAY = 6000;
export const CAT_COUNT = 5;
export const CAT_MIN_DURATION = 3;
export const CAT_MAX_ADDITIONAL_DURATION = 2;
export const CAT_MIN_TOP = 20;
export const CAT_MAX_TOP_RANGE = 60;
export const NAVIGATION_DELAY = 1500;
export const EXIT_DELAY = 2000;
