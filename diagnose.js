import WebSocket from 'ws';
import http from 'http';

// Helper to HTTP GET
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const targets = await httpGet('http://localhost:9222/json');
    const target = targets.find(t => t.url.includes('5173'));
    if (!target) {
      console.log('No Vite target found on localhost:9222. Targets:', targets);
      return;
    }
    
    console.log('Connecting to target:', target.webSocketDebuggerUrl);
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    
    let id = 1;
    const send = (method, params = {}) => {
      const msg = { id: id++, method, params };
      ws.send(JSON.stringify(msg));
    };
    
    ws.on('open', () => {
      console.log('Debugger connected!');
      send('Runtime.enable');
      send('Console.enable');
      
      // After 3 seconds, simulate clicking the Enter button
      setTimeout(() => {
        console.log('Sending click event to enter button...');
        send('Runtime.evaluate', {
          expression: `
            const btn = document.getElementById('btn-enter-universe');
            if (btn) {
              btn.click();
              'Enter button clicked';
            } else {
              'Enter button not found';
            }
          `
        });
      }, 3000);
      
      // After 6 seconds, dump the diagnostics
      setTimeout(() => {
        console.log('Extracting page diagnostics...');
        send('Runtime.evaluate', {
          expression: `
            (() => {
              const headline = document.querySelector('.welcome-headline');
              const subhead = document.querySelector('.welcome-sub-headline');
              const typing = document.getElementById('typing-text');
              const cta = document.querySelector('.cta-group');
              
              const getDetails = (el, name) => {
                if (!el) return name + ' is NULL';
                const style = window.getComputedStyle(el);
                return name + ': opacity=' + style.opacity + ', display=' + style.display + ', visibility=' + style.visibility + ', height=' + el.offsetHeight + 'px, color=' + style.color + ', parentHeight=' + el.parentElement.offsetHeight + 'px';
              };
              
              return {
                headline: getDetails(headline, 'Headline'),
                subhead: getDetails(subhead, 'Subhead'),
                typing: getDetails(typing, 'Typing'),
                cta: getDetails(cta, 'CTA'),
                headlineHTML: headline ? headline.outerHTML : 'NONE'
              };
            })()
          `,
          returnByValue: true
        });
      }, 6000);
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      
      // Print console logs from browser
      if (msg.method === 'Console.messageAdded') {
        console.log('[BROWSER CONSOLE]', msg.params.message.text);
      }
      
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', msg.params.args.map(a => a.value).join(' '));
      }
      
      // Capture evaluation response
      if (msg.id && msg.result) {
        if (msg.result.result && msg.result.result.value) {
          console.log('EVAL RESULT:', msg.result.result.value);
          if (typeof msg.result.result.value === 'object') {
            console.log('DIAGNOSTICS EXTRACTED:', JSON.stringify(msg.result.result.value, null, 2));
            ws.close();
            process.exit(0);
          }
        }
      }
    });
    
  } catch (err) {
    console.error('Diag script failed', err);
  }
}

run();
