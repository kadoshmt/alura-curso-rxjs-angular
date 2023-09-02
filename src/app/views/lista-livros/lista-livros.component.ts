import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EMPTY, catchError, debounceTime, filter, map, of, switchMap, tap, throwError } from 'rxjs';
import { Item, LivrosResultado } from 'src/app/models/interfaces';
import { LivroVolumeInfo } from 'src/app/models/livroVolumeInfo';
import { LivroService } from 'src/app/service/livro.service';

@Component({
  selector: 'app-lista-livros',
  templateUrl: './lista-livros.component.html',
  styleUrls: ['./lista-livros.component.css']
})
export class ListaLivrosComponent {

  campoBusca = new FormControl()
  mensagemErro = '';
  livrosResultado: LivrosResultado;
  quantidadeDeLivros = 0

  constructor(private service: LivroService) { }

  // totalDeLivros$ = this.campoBusca.valueChanges
  //   .pipe(
  //       debounceTime(2000),
  //       filter((valorDigitado) => valorDigitado.length >= 3),
  //       tap(() => console.log('Fluxo inicial')),
  //       switchMap((valorDigitado) => this.service.buscar(valorDigitado)),
  //       map(resultado => this.livrosResultado = resultado),
  //       catchError(erro => {
  //           console.log(erro)
  //           return of()
  //       })
  //   )


  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
      debounceTime(2000),
      filter(valorDigitado => valorDigitado.length >= 3),
      tap(() => console.log('Fluxo inicial')),
      switchMap(valorDigitado => this.service.buscar(valorDigitado)),
      map(resultado => this.livrosResultado = resultado),
      tap((retornoAPI) => this.quantidadeDeLivros = retornoAPI.totalItems || 0),
      map(resultado => resultado.items ?? []),
      map(items => this.livrosResultadoParaLivros(items)),
      catchError((erro) => {
        // this.mensagemErro = 'Ops, ocorreu um erro. Recarregue a aplicação!'
        // return EMPTY
        console.log(erro)
        return throwError(() => new Error(this.mensagemErro ='Ops, ocorreu um erro. Recarregue a aplicação!'))
      })
    )

  livrosResultadoParaLivros(items: Item[]): LivroVolumeInfo[] {
    return items.map(item => {
      return new LivroVolumeInfo(item)
    })
  }
}
