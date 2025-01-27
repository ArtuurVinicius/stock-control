import { EditCategoryAction } from './../../../../models/interfaces/categories/event/EditCategoryAction';
import { CategoryEvent } from './../../../../models/enums/categories/CategoryEvent';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/GetCategoriesResponse';
import { DeleteCategoryAction } from 'src/app/models/interfaces/categories/event/DeleteCategoryAction';

@Component({
  selector: 'app-categories-table',
  templateUrl: './categories-table.component.html',
  styleUrls: []
})
export class CategoriesTableComponent {

  @Input() public categories: Array<GetCategoriesResponse> = [];
  @Output() public categoryEvent = new EventEmitter<EditCategoryAction>();
  @Output() public deleteCategoryEvent = new EventEmitter<DeleteCategoryAction>();
  public categorySelected!: GetCategoriesResponse;
  public addCategoryAction = CategoryEvent.ADD_CATEGORY_ACTION;
  public EditCategoryAction = CategoryEvent.EDIT_CATEGORY_ACTION;

  handleDeleteCategoryEvent(categoryId: string, categoryName: string): void {
    if (categoryId !== '' && categoryName !== '') {
      this.deleteCategoryEvent.emit({ categoryId, categoryName });
    }
  }

  handleCategoryEvent(action: string, id?: string, categoryName?: string):void {
    if (action && action != '') {
      this.categoryEvent.emit({ action, id, categoryName });
    }
  }
}
