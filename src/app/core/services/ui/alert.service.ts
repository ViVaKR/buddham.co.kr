import { ViewportScroller } from '@angular/common';
import { inject, Injectable, NgZone } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { IBottomSheet } from '@app/core/interfaces/ui/i-bottom-sheet';
import { BottomSheet } from '@app/layout/bottom-sheet/bottom-sheet';

@Injectable({ providedIn: 'root' })
export class AlertService {

  private bottomSheet = inject(MatBottomSheet);
  private ngZone = inject(NgZone);
  private viewportScroller = inject(ViewportScroller);

  async openConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.ngZone.run(() => {
        let resolved = false;
        const once = (value: boolean) => {
          if (!resolved) {
            resolved = true;
            resolve(value);
          }
        };

        const sheetRef = this.bottomSheet.open(BottomSheet, {
          data: [{
            title: message,
            type: 'confirm',
            onConfirm: () => once(true),
            onCancel: () => once(false)
          }] as IBottomSheet[],
          panelClass: 'alert-bottom-sheet',
          hasBackdrop: true,
          restoreFocus: false
        });

        sheetRef.afterDismissed().subscribe(() => once(false));
      });
    });
  }

  /** 시트 열기 (await 가능 버전) */
  async openSheetAsync(data: IBottomSheet[]): Promise<void> {
    return new Promise((resolve) => {
      this.ngZone.run(() => {
        this.viewportScroller.scrollToPosition([0, 0], { behavior: 'smooth' });

        setTimeout(() => {
          const sheetRef = this.bottomSheet.open(BottomSheet, {
            data: data,
            panelClass: 'alert-bottom-sheet',
            hasBackdrop: true,
            restoreFocus: false
          });

          sheetRef.afterDismissed().subscribe(() => {
            setTimeout(() => {
              this.viewportScroller.scrollToPosition([0, 0], { behavior: 'smooth' });
              resolve();
            }, 0);
          });
        }, 300);
      });
    });
  }

  async openSheet(data: IBottomSheet[]): Promise<void> {
    this.ngZone.run(() => {

      // 1. 최상단으로 스크롤 (smooth)
      this.viewportScroller.scrollToPosition([0, 0], { behavior: 'smooth' });

      // 2. 스크롤 애니메잇션 시간을 고려한 딜레이 후 Bottom Sheet 열기
      setTimeout(() => {
        const sheetRef = this.bottomSheet.open(BottomSheet, {
          data: data,
          panelClass: 'alert-bottom-sheet',
          hasBackdrop: true,
          restoreFocus: false // 포커스 복원방지
        });

        // 3. 닫힌 후 최상단 유지
        sheetRef.afterDismissed().subscribe(() => {
          setTimeout(() => {
            this.viewportScroller.scrollToPosition([0, 0], { behavior: 'smooth' });
          }, 0);
        })
      }, 300);
    });
  }
}
