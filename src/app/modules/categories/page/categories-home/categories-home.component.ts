import { NotExpr } from '@angular/compiler';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { DeleteCategoryAction } from 'src/app/models/interfaces/categories/event/DeleteCategoryAction';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/GetCategoriesResponse';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';

@Component({
  selector: 'app-categories-home',
  templateUrl: './categories-home.component.html',
  styleUrls: []
})
export class CategoriesHomeComponent implements OnInit, OnDestroy {

  private readonly destroy$: Subject<void> = new Subject();
  private ref!: DynamicDialogRef;
  public categoriesDatas: Array<GetCategoriesResponse> = [];

  constructor(
    private categoriesService: CategoriesService,
    private dialogService: DialogService,
    private messaService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories() {
    this.categoriesService
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.categoriesDatas = response;
          }
        }, error: (error) => {
          console.log(error);
          this.messaService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Erro ao buscar categorias!'
          });
          this.router.navigate(['/dashboard']);
        }
      });
  }

  handleDeleteCategoryAction(event: DeleteCategoryAction): void {
    if (event) {
      this.confirmationService.confirm({
        message: `Confirma a exclusão da categoria ${event?.categoryName}?`,
        header: 'Confirmação de exclusão',
        icon: 'pi pi-esclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.deleteCategory(event?.categoryId)
      })
  }
}

  deleteCategory(category_id: string): void {
    if (category_id) {
      this.categoriesService.deleteCategory({ category_id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.getAllCategories();
          this.messaService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria deletada com sucesso!',
            life: 3000
          });
        },
        error: (error) => {
          console.log(error);
          this.getAllCategories();
          this.messaService.add({
            severity: 'Error',
            summary: 'Erro',
            detail: 'Erro ao remover categoria',
            life: 3000
          });
        }
      })
      this.getAllCategories();
    }
  }

  handleCategoryAction(event: EventAction): void {
    if (event) {
      this.ref = this.dialogService.open(CategoryFormComponent, {
        header: event?.action,
        width: '70%',
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event
        }
      })
      this.ref.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.getAllCategories()
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
