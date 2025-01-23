import { GetAllProductsResponse } from './../../../../models/interfaces/products/response/GetAllProductsResponse';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { ProductEvent } from 'src/app/models/enums/products/productEvent';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/GetCategoriesResponse';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: []
})
export class ProductFormComponent implements OnInit, OnDestroy{

  private readonly destroy$: Subject<void> = new Subject();
  public categoriesDatas: Array<GetCategoriesResponse> = [];
  public productAction!: {
    event: EventAction;
    productDatas: Array<GetAllProductsResponse>
  };
  public productSelectedDatas!: GetAllProductsResponse;
  public productsDatas: Array<GetAllProductsResponse> = [];
  public selectedCategories: Array<{name: string; code: string}> = [];
  public addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
  })
  public editProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
  });

  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT;
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT;

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private productsDtService: ProductsDataTransferService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    public ref: DynamicDialogConfig,

  ) {}

  ngOnInit(): void {
    this.productAction = this.ref.data;

    if(this.productAction?.event?.action === this.editProductAction && this.productAction?.productDatas) {
      this.getProductSelectedDatas(this.productAction?.event?.id as string);
    }

    this.productAction?.event?.action === this.saleProductAction && this.getProductDatas();

    this.getAllCategories();
  }

  getAllCategories(): void {
    this.categoriesService.getAllCategories()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if(response.length > 0){
          this.categoriesDatas = response;
        }
      }
    })
  }

  handleSubmitAddProduct(): void {
    if (this.addProductForm?.value && this.addProductForm?.valid) {
      const requestCreateProduct: CreateProductRequest = {
        name: this.addProductForm.value.name as string,
        price: this.addProductForm.value.price as string,
        description: this.addProductForm.value.description as string,
        category_id: this.addProductForm.value.category_id as string,
        amount: Number(this.addProductForm.value.amount),
      };

      this.productsService.createProduct(requestCreateProduct)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if(response) {
            this.messageService.add({
              severity:'success',
              summary:'Sucesso',
              detail: 'Produto criado com sucesso!',
              life: 2500
            })
          }
        }, error: (error) => {
          console.log(error);
          this.messageService.add({
            severity:'error',
            summary: 'Erro',
            detail: 'Erro ao criar produto',
            life: 2500
          })
        }
      })
    }

    this.addProductForm.reset();
  }

  handleSubmitEditProduct(): void {
    if(this.editProductForm.value &&
       this.editProductForm.valid &&
       this.productAction.event.id
      ) {
        const requestEditProduct: EditProductRequest = {
          name: this.editProductForm.value.name as string,
          price: this.editProductForm.value.price as string,
          description: this.editProductForm.value.description as string,
          product_id: this.productAction?.event?.id as string,
          amount: this.editProductForm.value.amount as number,
        };

        this.productsService
        .editProduct(requestEditProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto editado com sucesso!',
              life: 2500
            });
            this.editProductForm.reset();
          }, error: (error) => {
            console.log(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar produto',
              life: 2500
            });
            this.editProductForm.reset();
          }
        })
    }
  }

  getProductSelectedDatas(productId: string): void {
    const allProducts = this.productAction?.productDatas;

    if(allProducts.length > 0) {
      const productFiltered = allProducts.filter((element) => element?.id === productId);

      if(productFiltered) {
        this.productSelectedDatas = productFiltered[0];
        this.editProductForm.setValue({
          name: this.productSelectedDatas?.name,
          price: this.productSelectedDatas?.price,
          amount: this.productSelectedDatas?.amount,
          description: this.productSelectedDatas?.description,
        })
      }
    }
  }

  getProductDatas(): void {
    this.productsService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productsDatas = response;
            this.productsDatas &&
              this.productsDtService.setProductsDatas(this.productsDatas);
          }
        },
      });
  }

  ngOnDestroy(): void {
    this,this.destroy$.next();
    this,this.destroy$.complete();
  }
}
