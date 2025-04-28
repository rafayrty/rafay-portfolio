'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import styles from './Terminal.module.css';
import Head from 'next/head';

const sections = [
  'Abdul Rafay\'s FullStack Portfolio',
  //'',
  '. About Me',
  '. Projects',
  '. Skills',
  '. Contact'
];

type ContentKey = '1' | '2' | '3' | '4';
const content: Record<ContentKey, string> = {
  '1': `Curious and detail-oriented Full Stack Developer with a strong focus on frontend performance, design systems, and
user experience. I enjoy building scalable, intuitive interfaces and thrive in diverse, collaborative environments. With
a love for clean code, continuous learning, and coding in Vim, I bring both technical depth and a growth mindset to
every project.`,
  '2': 'Recent Projects:\n- WEBRTC YOLOv8 Pose Classifier\n- Basmti - Personalized Book Store\n- Browser-based Vim Portfolio',
  '3': `\x1b[33mLanguages:\x1b[0m TypeScript, PHP, Golang\n\x1b[32mFrameworks:\x1b[0m Laravel, Vue.js, Storybook, Express.js Tailwind.css, React\n\x1b[34mTools:\x1b[0m Docker, Git, Vim \n\x1b[35mCloud:\x1b[0m AWS, GCP, JENKINS, GITHUB CI\n\x1b[31mTesting:\x1b[0m Cypress,JEST,PHPUNIT`,
  '4': 'Email: abdulrafayrty@gmail.com\nGitHub: https://github.com/rafayrty'
};

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inMenu, setInMenu] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const clickableLines = useRef<Map<number, number>>(new Map());

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || termRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#282828',
        foreground: '#ebdbb2',
        cursor: '#fabd2f',
        black: '#282828',
        red: '#cc241d',
        green: '#98971a',
        yellow: '#d79921',
        blue: '#458588',
        magenta: '#b16286',
        cyan: '#689d6a',
        white: '#a89984',
        brightBlack: '#928374',
        brightRed: '#fb4934',
        brightGreen: '#b8bb26',
        brightYellow: '#fabd2f',
        brightBlue: '#83a598',
        brightMagenta: '#d3869b',
        brightCyan: '#8ec07c',
        brightWhite: '#ebdbb2'
      },
      cursorBlink: true,
      lineHeight: 1.2,
      fontSize: 16,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      scrollback: 1000,
      disableStdin: typeof window !== 'undefined' && window.innerWidth <= 768, // ⬅️ ADD THIS LINE
      allowTransparency: true
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon(
      (event, uri) => {
        if (uri.startsWith('http')) {
          window.open(uri, '_blank');
        } else if (uri.includes('@')) {
          window.open(`mailto:${uri}`, '_blank');
        }
      },
      { urlRegex: /((https?:\/\/[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))/ }
    );

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      term.textarea?.blur();
    }

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Render Menu
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;

    const renderMenu = () => {
      term.clear();
      clickableLines.current.clear();

      sections.forEach((line, index) => {
        const lineNumber = index + 1;
        const padding = ' '.repeat(1 - String(lineNumber).length);
        const isHovered = hoveredRow === (lineNumber - 1);
        const isSelected = selectedIndex === index;

        let displayLine = `${padding}${lineNumber}|`;

        if (isSelected) {
          displayLine += ' > ';
        } else {
          displayLine += '   ';
        }

        if (isHovered && index !== 0) {
          displayLine += `\x1b[4m${line}\x1b[24m`; // underline hover (not welcome line)
        } else {
          let colorCode = '';
          if (index === 0) {
            // Bold welcome line
            displayLine += `\x1b[1m${line}\x1b[22m`;
          } else {
            if (line.includes('About')) {
              colorCode = '\x1b[31m'; // Red
            } else if (line.includes('Projects')) {
              colorCode = '\x1b[33m'; // Yellow
            } else if (line.includes('Skills')) {
              colorCode = '\x1b[32m'; // Green
            } else if (line.includes('Contact')) {
              colorCode = '\x1b[36m'; // Cyan
            }
            displayLine += `${colorCode}${line}\x1b[0m`;
          }
        }

        term.writeln(displayLine);

        if (index !== 0) {
          clickableLines.current.set(lineNumber - 1, index);
        }
      });
    };

    const showContent = (index: number) => {
      term.clear();
      clickableLines.current.clear();

      const contentKey = String(index) as ContentKey;
      const lines = content[contentKey]?.split('\n') || ['Coming Soon...'];

      // Write section header
      term.writeln(`1| ${sections[index]}`);
      term.writeln(`2|`);

      lines.forEach((line, i) => {
        term.writeln(`${i + 3}| ${line}`);
      });

      // After content, add an empty line
      const emptyLineNumber = lines.length + 3;
      term.writeln(`${emptyLineNumber}|`);

      let backLineNumber = emptyLineNumber + 1;

      // If screen is wide, show "Press Enter to go back" above Back
      if (window.innerWidth > 768) {
        term.writeln(`${backLineNumber}| Press Backspace to go back`);
        backLineNumber += 1;
      }

      // Write back button at the last line
      const backIcon = '\x1b[37m⬅️\x1b[0m';
      term.writeln(`${backLineNumber}| ${backIcon} \x1b[31mBack\x1b[0m`);

      // Mark the Back button clickable
      clickableLines.current.set(backLineNumber - 1, -1);
    };

    if (inMenu) {
      renderMenu();
    } else {
      showContent(selectedIndex);
    }

    const handleKey = ({ key }: { key: string }) => {
      if (inMenu) {
        if (key === 'j') {
          setSelectedIndex((prev) => (prev + 1) % sections.length);
        } else if (key === 'k') {
          setSelectedIndex((prev) => (prev - 1 + sections.length) % sections.length);
        } else if (key === '\r') {
          if (selectedIndex !== 0) {
            setInMenu(false);
          }
        }
      } else {
        if (key === '\r' || key === '\x7f') {  // '\x7f' is Backspace
          setInMenu(true);
        }
      }
    };

    const disposable = term.onKey(handleKey);

    return () => {
      disposable.dispose();
    };
  }, [selectedIndex, inMenu, hoveredRow]);

  // Mouse move for hover
  const handleMouseMove = (e: React.MouseEvent) => {
    const term = termRef.current;
    if (!term) return;

    const bounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const y = e.clientY - bounds.top;
    const cellHeight = bounds.height / term.rows;
    const row = Math.floor(y / cellHeight);
    const logicalRow = row - 1;

    if (clickableLines.current.has(logicalRow)) {
      if (hoveredRow !== logicalRow) {
        setHoveredRow(logicalRow);
      }
    } else if (hoveredRow !== null) {
      setHoveredRow(null);
    }
  };

  // Mouse click for selecting
  const handleMouseDown = (e: React.MouseEvent) => {
    const term = termRef.current;
    if (!term) return;

    const bounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const y = e.clientY - bounds.top;
    const cellHeight = bounds.height / term.rows;
    const row = Math.floor(y / cellHeight);
    const logicalRow = row - 1;

    const index = clickableLines.current.get(logicalRow);
    if (index !== undefined) {
      if (inMenu) {
        setSelectedIndex(index);
        setInMenu(false);
      } else {
        if (index === -1) {
          // Back clicked
          setInMenu(true);
        }
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className={styles['terminal-container']}>
        <div
          ref={terminalRef}
          className={styles.terminal}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
        />
        <div className={styles.hint}>
          <strong>Vim Based Portfolio:</strong><br />
          <p>Use <code>j/k</code> to move up/down</p>
          <p>Use <code>Enter</code> to select</p>
          <p>Click items or anywhere to activate terminal</p>
          <p>Hover over sections to highlight</p>
        </div>
      </div>
    </>
  );
}
