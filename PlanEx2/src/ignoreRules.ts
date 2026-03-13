/**
 * Ignore Rules
 * gitignore 스타일의 무시 패턴을 관리합니다.
 * `ignore` npm 패키지를 사용합니다 (lessons_learned.md 참조).
 */
import ignore from 'ignore';

const DEFAULT_IGNORES = [
  'node_modules',
  '.git',
  '.DS_Store',
  'Thumbs.db',
  '*.log',
  'out',
  'out-test',
  '.vscode',
  '.planex2ignore',
];

/**
 * 파일 경로가 무시 패턴에 해당하는지 판별하는 필터 함수를 반환합니다.
 * @param customPatterns 추가 무시 패턴 목록
 * @returns (relativePath: string) => boolean — true면 무시
 */
export function createIgnoreFilter(
  customPatterns?: string[]
): (relativePath: string) => boolean {
  const ig = ignore();
  ig.add(DEFAULT_IGNORES);
  if (customPatterns && customPatterns.length > 0) {
    ig.add(customPatterns);
  }
  return (relativePath: string) => {
    try {
      return ig.ignores(relativePath);
    } catch {
      return false;
    }
  };
}
