import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductEvent } from 'src/app/models/enums/products/productEvent';
import { DeleteProductAction } from 'src/app/models/interfaces/products/event/DeleteProductAction';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';


@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: []
})
export class ProductsTableComponent {

  @Input() products: Array<GetAllProductsResponse> = [];
  @Output() productEvent = new EventEmitter<EventAction>();
  @Output() productDeleteEvent = new EventEmitter<DeleteProductAction>();

  public productSelected!: GetAllProductsResponse;
  public addProductEvent = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductEvent = ProductEvent.EDIT_PRODUCT_EVENT;

  handleProductEvent(action: string, id?: string): void {
    if(action && action !== '') {
      const productEventData = id && id !== '' ? { action, id } : { action };
      this.productEvent.emit(productEventData);

    }
  }

  handleDeleteProduct(product_id: string, productName: string): void {
    if(product_id !== '' && productName !== '') {
      this.productDeleteEvent.emit({ product_id, productName });
    }
  }
}
