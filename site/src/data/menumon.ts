import apollo from '../assets/menumon/apollo-monitor.png';
import battery from '../assets/menumon/battery-time.png';
import claude from '../assets/menumon/claude-usage.png';
import homestead from '../assets/menumon/homestead.png';
import keylight from '../assets/menumon/keylight.png';
import macDaddy from '../assets/menumon/mac-daddy.png';
import macrecorder from '../assets/menumon/macrecorder.png';
import panes from '../assets/menumon/panes.png';
import soundchain from '../assets/menumon/soundchain.png';
import vpn from '../assets/menumon/vpn-dns.png';

export const MENUMON_APPS = [
  { name: 'Homestead', image: homestead, does: "Your smart home in the menu bar. A tiny cottage lights up as your lights do." },
  { name: 'Apollo Monitor', image: apollo, does: "Turns the Mac's volume keys into controls for a studio audio interface." },
  { name: 'Panes', image: panes, does: 'Snaps windows into place and looks after your displays.' },
  { name: 'Battery Time', image: battery, does: "Brings back the battery time estimate Apple took out of the menu bar." },
  { name: 'KeyLight', image: keylight, does: 'Keyboard backlight shortcuts, and media keys for any keyboard.' },
  { name: 'SoundChain', image: soundchain, does: 'Runs a chain of audio effects over everything your Mac plays.' },
  { name: 'MacRecorder', image: macrecorder, does: 'Screen recording with system audio, one shortcut away.' },
  { name: 'VPN & DNS', image: vpn, does: 'Shows and switches your private connections at a glance.' },
  { name: 'Claude Usage', image: claude, does: 'Keeps an eye on how much of your AI plan is left.' },
  { name: 'Mac Daddy', image: macDaddy, does: 'Keeps runaway programs and old downloads in check.' },
];
