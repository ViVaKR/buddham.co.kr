import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { IBottomSheet } from '@app/core/interfaces/ui/i-bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatAnchor } from '@angular/material/button';
@Component({
  selector: 'viv-bottom-sheet',
  imports: [MatListModule, MatAnchor],
  templateUrl: './bottom-sheet.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './bottom-sheet.scss',
})
export class BottomSheet {
  private sheetRef = inject(MatBottomSheetRef<BottomSheet>);
  readonly dataList = signal<IBottomSheet[]>(inject<IBottomSheet[]>(MAT_BOTTOM_SHEET_DATA));

  close(event: MouseEvent): void {
    event.preventDefault();
    this.sheetRef.dismiss();
  }

  // bottom-sheet.ts
  onConfirm(item: IBottomSheet) {
    item.onConfirm?.();
    this.sheetRef.dismiss();
  }

  onCancel(item: IBottomSheet) {
    item.onCancel?.();
    this.sheetRef.dismiss();
  }
}
