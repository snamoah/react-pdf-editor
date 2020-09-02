type ScriptName =
  | 'pdfjsLib'
  | 'PDFLib'
  | 'download'
  | 'makeTextPDF'
  | 'w3Color';

interface Script {
  name: ScriptName;
  src: string;
}

const scripts: Script[] = [
  {
    name: 'pdfjsLib',
    src: 'https://unpkg.com/pdfjs-dist@2.3.200/build/pdf.min.js',
  },
  {
    name: 'PDFLib',
    src: 'https://unpkg.com/pdf-lib@1.4.0/dist/pdf-lib.min.js',
  },
  {
    name: 'download',
    src: 'https://unpkg.com/downloadjs@1.4.7',
  },
  {
    name: 'makeTextPDF',
    src:
      'https://cdn.jsdelivr.net/gh/snamoah/react-pdf-editor/public/makeTextPDF.js',
  },
  { name: 'w3Color', src: 'https://www.w3schools.com/lib/w3color.js' },
];

const assets: Record<string, any> = {};
export const getAsset = (scriptName: string) => assets[scriptName];

export const prepareAssets = (): void => {
  // prepare scripts
  scripts.forEach(({ name, src }) => {
    assets[name] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(window[name as any]);
        console.log(`${name} is loaded.`);
      };
      script.onerror = () =>
        reject(`The script ${name} didn't load correctly.`);
      document.body.appendChild(script);
    });
  });
};

interface Font {
  src?: string;
  correction?: (size: number, lineHeight: number) => number;
  [key: string]: any;
}

interface FontsType {
  [key: string]: Font;
}

const fonts: FontsType = {
  Courier: {
    correction(size: number, lineHeight: number) {
      return (size * lineHeight - size) / 2 + size / 6;
    },
  },
  Helvetica: {
    correction(size: number, lineHeight: number) {
      return (size * lineHeight - size) / 2 + size / 10;
    },
  },
  'Times-Roman': {
    correction(size: number, lineHeight: number) {
      return (size * lineHeight - size) / 2 + size / 7;
    },
  },
};

// Available fonts
export const Fonts = {
  ...fonts,
  標楷體: {
    src: '/CK.ttf', // 9.9 MB
    correction(size: number, lineHeight: number) {
      return (size * lineHeight - size) / 2;
    },
  },
};

export const fetchFont = (name: string) => {
  if (fonts[name as any]) return fonts[name as any];

  const font = Fonts[name as keyof typeof Fonts];
  if (!font) throw new Error(`Font '${name}' not exists.`);

  fonts[name] = fetch(font.src)
    .then((r) => r.arrayBuffer())
    .then((fontBuffer) => {
      const fontFace = new (window as any).FontFace(name, fontBuffer);
      fontFace.display = 'swap';
      fontFace.load().then(() => (document as any).fonts.add(fontFace));
      return {
        ...font,
        buffer: fontBuffer,
      };
    });
};
