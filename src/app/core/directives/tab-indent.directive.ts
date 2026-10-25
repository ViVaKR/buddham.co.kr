import { Directive, HostListener, input, output } from '@angular/core';

@Directive({ selector: 'textarea[tabIndent]' })
export class TabIndent {

    // 들여쓰기 칸 수 (기본 4칸)
    indentSize = input<number>(4);

    // 실제 탭 문자 사용 여부 (기본: 공백 사용)
    useTabChar = input<boolean>(false);

    // Shift+Tab으로 내어쓰기 기능 활성화 (기본: true)
    enableOutdent = input<boolean>(true);

    // 들여쓰기 발생 시 이벤트
    indented = output<number>();

    @HostListener('keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Tab') {
            event.preventDefault();

            const textarea = event.target as HTMLTextAreaElement;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            if (event.shiftKey && this.enableOutdent()) {
                // Shift+Tab: 내어쓰기
                this.outdent(textarea, start, end, value);
            } else {
                // Tab: 들여쓰기
                this.indent(textarea, start, end, value);
            }
        }
    }

    private indent(textarea: HTMLTextAreaElement, start: number, end: number, value: string) {
        const indentChar = this.useTabChar() ? '\t' : ' '.repeat(this.indentSize());

        if (start === end) {
            // 선택 영역 없음: 커서 위치에 들여쓰기
            textarea.value = value.substring(0, start) + indentChar + value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + indentChar.length;
        } else {
            // 선택 영역 있음: 각 줄 앞에 들여쓰기
            const lines = value.substring(start, end).split('\n');
            const indented = lines.map(line => indentChar + line).join('\n');
            textarea.value = value.substring(0, start) + indented + value.substring(end);
            textarea.selectionStart = start;
            textarea.selectionEnd = start + indented.length;
        }

        this.triggerChange(textarea);
        this.indented.emit(this.indentSize());
    }

    private outdent(textarea: HTMLTextAreaElement, start: number, end: number, value: string) {
        const indentPattern = this.useTabChar()
            ? /^\t/gm
            : new RegExp(`^ {1,${this.indentSize()}}`, 'gm');

        if (start === end) {
            // 현재 줄 내어쓰기
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = value.indexOf('\n', start);
            const line = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
            const outdented = line.replace(indentPattern, '');
            const removed = line.length - outdented.length;

            textarea.value = value.substring(0, lineStart) + outdented + value.substring(lineEnd === -1 ? value.length : lineEnd);
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - removed);
        } else {
            // 선택 영역의 각 줄 내어쓰기
            const selectedText = value.substring(start, end);
            const outdented = selectedText.replace(indentPattern, '');
            textarea.value = value.substring(0, start) + outdented + value.substring(end);
            textarea.selectionStart = start;
            textarea.selectionEnd = start + outdented.length;
        }

        this.triggerChange(textarea);
    }

    private triggerChange(textarea: HTMLTextAreaElement) {
        // Angular change detection 트리거
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

}
