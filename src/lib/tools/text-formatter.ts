/**
 * LinkedIn Unicode Text Formatter
 *
 * LinkedIn doesn't support native markdown formatting. Instead, Unicode
 * mathematical alphanumeric symbols are used to create visual formatting
 * effects that render in LinkedIn posts.
 */

type StyleKey = 'bold' | 'italic' | 'bold-italic' | 'monospace' | 'strikethrough' | 'underline' | 'sans-bold' | 'sans-italic' | 'sans-bold-italic' | 'double-struck';

interface CharMap {
  uppercase?: string;
  lowercase?: string;
  digits?: string;
}

const CHAR_MAPS: Record<StyleKey, CharMap> = {
  bold: {
    uppercase: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙',
    lowercase: '𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳',
    digits: '𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗',
  },
  italic: {
    uppercase: '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍',
    lowercase: '𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧',
    digits: '0123456789',
  },
  'bold-italic': {
    uppercase: '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁',
    lowercase: '𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛',
    digits: '0123456789',
  },
  monospace: {
    uppercase: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉',
    lowercase: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣',
    digits: '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿',
  },
  strikethrough: {
    uppercase: 'A\u0336B\u0336C\u0336D\u0336E\u0336F\u0336G\u0336H\u0336I\u0336J\u0336K\u0336L\u0336M\u0336N\u0336O\u0336P\u0336Q\u0336R\u0336S\u0336T\u0336U\u0336V\u0336W\u0336X\u0336Y\u0336Z\u0336',
    lowercase: 'a\u0336b\u0336c\u0336d\u0336e\u0336f\u0336g\u0336h\u0336i\u0336j\u0336k\u0336l\u0336m\u0336n\u0336o\u0336p\u0336q\u0336r\u0336s\u0336t\u0336u\u0336v\u0336w\u0336x\u0336y\u0336z\u0336',
    digits: '0\u03361\u03362\u03363\u03364\u03365\u03366\u03367\u03368\u03369\u0336',
  },
  underline: {
    uppercase: 'A\u0332B\u0332C\u0332D\u0332E\u0332F\u0332G\u0332H\u0332I\u0332J\u0332K\u0332L\u0332M\u0332N\u0332O\u0332P\u0332Q\u0332R\u0332S\u0332T\u0332U\u0332V\u0332W\u0332X\u0332Y\u0332Z\u0332',
    lowercase: 'a\u0332b\u0332c\u0332d\u0332e\u0332f\u0332g\u0332h\u0332i\u0332j\u0332k\u0332l\u0332m\u0332n\u0332o\u0332p\u0332q\u0332r\u0332s\u0332t\u0332u\u0332v\u0332w\u0332x\u0332y\u0332z\u0332',
    digits: '0\u03321\u03322\u03323\u03324\u03325\u03326\u03327\u03328\u03329\u0332',
  },
  'sans-bold': {
    uppercase: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭',
    lowercase: '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇',
    digits: '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵',
  },
  'sans-italic': {
    uppercase: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡',
    lowercase: '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻',
    digits: '0123456789',
  },
  'sans-bold-italic': {
    uppercase: '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕',
    lowercase: '𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯',
    digits: '0123456789',
  },
  'double-struck': {
    uppercase: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ',
    lowercase: '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫',
    digits: '𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡',
  },
};

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';

function transformChar(char: string, map: CharMap): string {
  const upperIdx = UPPERCASE.indexOf(char);
  if (upperIdx !== -1 && map.uppercase) {
    // Handle combining characters (strikethrough, underline)
    if (char === 'A' && map.uppercase.includes('\u0336')) {
      const parts = map.uppercase.split('\u0336');
      return parts[upperIdx] + '\u0336';
    }
    // For non-combining styles, use array spreading for proper emoji/unicode handling
    const chars = [...map.uppercase];
    return chars[upperIdx] ?? char;
  }

  const lowerIdx = LOWERCASE.indexOf(char);
  if (lowerIdx !== -1 && map.lowercase) {
    const chars = [...map.lowercase];
    return chars[lowerIdx] ?? char;
  }

  const digitIdx = DIGITS.indexOf(char);
  if (digitIdx !== -1 && map.digits) {
    const chars = [...map.digits];
    return chars[digitIdx] ?? char;
  }

  return char;
}

export function formatText(text: string, style: StyleKey): string {
  const map = CHAR_MAPS[style];
  if (!map) return text;

  if (style === 'strikethrough') {
    return [...text].map((char) => {
      if (char === ' ' || char === '\n') return char;
      return char + '\u0336';
    }).join('');
  }

  if (style === 'underline') {
    return [...text].map((char) => {
      if (char === ' ' || char === '\n') return char;
      return char + '\u0332';
    }).join('');
  }

  return [...text].map((char) => {
    if (char === ' ' || char === '\n') return char;
    return transformChar(char, map);
  }).join('');
}

export const STYLES: Array<{
  key: StyleKey;
  label: string;
  preview: string;
  description: string;
}> = [
  { key: 'bold', label: 'Bold', preview: '𝐁𝐨𝐥𝐝', description: 'Mathematical bold serif' },
  { key: 'italic', label: 'Italic', preview: '𝐼𝑡𝑎𝑙𝑖𝑐', description: 'Mathematical italic' },
  { key: 'bold-italic', label: 'Bold Italic', preview: '𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄', description: 'Mathematical bold italic' },
  { key: 'sans-bold', label: 'Sans Bold', preview: '𝗦𝗮𝗻𝘀 𝗕𝗼𝗹𝗱', description: 'Sans-serif bold' },
  { key: 'sans-italic', label: 'Sans Italic', preview: '𝘚𝘢𝘯𝘴 𝘐𝘵𝘢𝘭𝘪𝘤', description: 'Sans-serif italic' },
  { key: 'sans-bold-italic', label: 'Sans Bold Italic', preview: '𝙎𝙖𝙣𝙨 𝘽𝙤𝙡𝙙 𝙄𝙩𝙖𝙡𝙞𝙘', description: 'Sans-serif bold italic' },
  { key: 'monospace', label: 'Monospace', preview: '𝙼𝚘𝚗𝚘', description: 'Monospace style' },
  { key: 'strikethrough', label: 'Strikethrough', preview: 'S̶t̶r̶i̶k̶e̶', description: 'Strikethrough text' },
  { key: 'underline', label: 'Underline', preview: 'U̲n̲d̲e̲r̲l̲i̲n̲e̲', description: 'Underline alternative' },
  { key: 'double-struck', label: 'Double Struck', preview: '𝔻𝕠𝕦𝕓𝕝𝕖', description: 'Double-struck style' },
];
