const KB = 1000;
const MB = 1000 * KB;
const GB = 1000 * MB;
const TB = 1000 * GB;
const PB = 1000 * TB;

const KiB = 1024;
const MiB = 1024 * KiB;
const GiB = 1024 * MiB;
const TiB = 1024 * GiB;
const PiB = 1024 * TiB;

const decimalMap = { k: KB, m: MB, g: GB, t: TB, p: PB };
const binaryMap = { k: KiB, m: MiB, g: GiB, t: TiB, p: PiB };
const sizeRegex = /^(\d+(\.\d+)*) ?([kKmMgGtTpP])?[bB]?$/;

export function RAMInBytes(size: string): number {
	return parseSize(size, binaryMap);
}

export function parseSize (sizeStr: string, uMap: object): number {
  const matches = sizeRegex.exec(sizeStr);
  if (!matches || matches.length != 4) {
    throw new Error(`invalid size: ${sizeStr}`);
  }

  let size = parseFloat(matches[1]);
  const unitPrefix = matches[3].toLowerCase();
  const mul = uMap[unitPrefix];
  if (mul) {
    size *= mul;
  }

  return size;
}
