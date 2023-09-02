# Buscante

Código e resumo do curso da Alura sobre RxJS no Angular.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

# Sobre RxJS

## O que é RxJS?

O RxJS significa **"Reactive Extensions Library for JavaScript"** (ou **"Biblioteca de Extensões Reativas para Javascript"**).
Trata-se de uma biblioteca para **programação reativa**, para construção de programas assíncronos, ou baseados em eventos. Ela utiliza uma coleção de Observables.

## Observable e Observers

No RxJS temos dois conceitos essenciais:
1. **Observable**, o qual representa a ideia de uma coleção de valores ou eventos futuros;
2. **Observer**, o qual representa a ideia de uma coleção de callbacks. Ele consegue ouvir os valores entregues pelo Observable.

```typescript
 buscar (valorDigitado: string): Observable<any>{
    const params = new HttpParams().append('q', valorDigitado);
    return this.http.get(this.API,  {params})
  }
```

**Por que não conseguimos realizar a ligação e obtenção de respostas entre o Observable e o Observer?** Isso ocorre porque o Observable é lazy, ("preguiçoso"). Isso significa que o **Observer precisa informar que está interessado nas suas informações**. Isso é feito através de uma inscrição (*subscribe*). Por meio do *subscribe()* componentes podem se inscrever para receber notificações quando o evento ocorrer e acessar as mudanças decorrentes dele.

***O padrão observer é a base da programação orientada a eventos.*** Outro nome para esse padrão é **Pub/Sub**, abreviação de publication / subscription ("publicação" / "assinatura").

```typescript
buscarLivros() {
    this.service.buscar(this.campoBusca).subscribe(
        (retornoAPI) => console.log(retornoAPI)
        (error) => console.log(error)
    )
}
```

A forma de utilização do subscribe acima está obsoleta e será removida na próxima versão (v8) do RxJS. Agora é utilizado passando um objeto contendo Next, Error, Complete.

### Next, Error, Complete

Para que o risco atravessando o subscribe() desapareça, informaremos argumentos separados de uma forma diferente, criando um objeto e informando notificações emitidas pelo Observable.

Há 3 tipos de notifificações emitidas pelo ***subscribe()***
1. **"Next"** é tida como a mais importante e a mais comum. É ela que nos trará dados.
2. **"Error"** nos trará erros de diversos tipos — no caso do Angular, o HttpErrorResponse, e encerrará o ciclo de vida do Observable;
3. **"Complete"** não traz dados, mas também encerra o ciclo de vida do Observable.

Temos as seguintes diferenças entre as notificações:
- "Error" e "Complete" são opcionais. É possível informar somente a notificação next. Ambos só podem ser emitidos uma vez, e só pode haver um deles por ciclo de vida;
- a "Next" é a mais importante e pode ser emitida mais de uma vez, ou seja, o Observable pode emitir valores várias vezes durante a sua existência.

### Unsubscribe

Por que precisamos nos desinscrever? Sempre que realizamos um subscribe, temos como boa prática a realização do unsubscribe para liberar recursos e evitar vazamentos de memória.
A Subscription representa a assinatura ou a execução do Observable e possui o unsubscribe como método importante. Ele é utilizado para liberar recursos e cancelar execuções do Observable.
Quando realizamos um subscribe do Observer no Observable, esse processo nos retornará uma assinatura. Ela será do tipo Subscription. Podemos guardar este retorno em um parâmetro.
Agora, podemos adicionar o método ngOnDestroy() {} do ciclo de vida do Angular, que ocorrerá quando este componente for destruído.
Nele, chamamos o método unsubscribe() da subscription. Este método não receberá argumentos, apenas encerrará o Observable.


```typescript
...
subscription: Subscription

constructor(private service: LivroService) { }

buscarLivros(){
    this.subscription = this.service.buscar(this.campoBusca).subscribe({
      next: retornoAPI => console.log(retornoAPI),
      error: error => console.log(error),
      complete: () => console.log('Observable completado'),
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
```

### Tipando o retorno da API

A API do Google Books nos retorna um objeto muito complexo, que possui um totalItems e um arranjo de 10 itens, cada qual corresponde a um cartão que será renderizado.
Nós não precisamos de todas essas informações, portanto aprenderemos a abstrair as informações que não precisamos e a manipular esse fluxo utilizando o RxJS.
Precisamos de um modelo que caracterize esse retorno da API com as informações que precisamos. No Angular, quando precisamos criar um modelo, criamos um arquivo chamado Interface.
Precisaremos criar mais de uma interface, pois o objeto é complexo. Veja o resultado final no arquivo .src/apps/models/interfaces.ts
Agora que definimos o objeto de retorno da API, podemos então substituir o tipo do Observable de <any> para <LivrosResultado>.

```typescript
buscar(valorDigitado: string): Observable<LivrosResultado> {
  const params = new HttpParams().append('q', valorDigitado)
  return this.http.get<LivrosResultado>(this.API, { params })
}
```

### Operadores Pipe, Tap e Map

Agora que tipamos o retorno fo método get(), é indicado usar operadores do RxJS para transformarmos a resposta obtida pela API.
Operadores são funções que conseguem combinar diversos tipos de Observable<>s para obter diferentes tipos de resposta. Veremos três que nos serão úteis.
Utilizaremos o ***pipe()*** primeiramente, que servirá para agrupar diversos outros tipos de operadores, então é como a tradução "cano" em que passará o fluxo de informações para aplicarmos as transformações.
Dentro do Pipe, utilizaremos o ***tap()***,  que por sua vez é como se fosse um "espião", ou seja, é utilizado apenas para debug da aplicação.
Ele pode ser utilizado em qualquer etapa da aplicação, pois não irá modificar o fluxo do ***Observable<>*** anterior.


```typescript
buscar(valorDigitado: string): Observable<LivrosResultado> {
  const params = new HttpParams().append('q', valorDigitado )
  return this.http.get<LivrosResultado>(this.API, { params })
    .pipe(
      tap(retornoAPI => console.log('Fluxo do tap', retornoAPI)),
    )
}

```
Quando queremos aplicar uma transformação do fluxo des dados recebidos da API, poderemos usar o operador ***map()***. O método é semelhante à função map() utilizada para arrays no javascript.
Agora que estamso retornando o objeto do tipo *Items* de denteo de *LivrosResultado*, é preciso mudar o retorno do método buscar(), de *LivrosResultado* para *Items[]* 

```typescript
buscar(valorDigitado: string): Observable<Item[]> {
  const params = new HttpParams().append('q', valorDigitado )
  return this.http.get<LivrosResultado>(this.API, { params })
    .pipe(
      tap(retornoAPI => console.log('Fluxo do tap', retornoAPI)),
      map(resultado => resultado.items),
      tap(resultado => console.log('Fluxo após o map', resultado))
    )
  }
```

### Busca Typeahead

É comum implementar buscas dinâmicas conforme o usuário vai digitando a informação. Isto é chamado de busca typeahed (digitação antecipada).
Será feito uma refatoração no código para implantarmos este recurso e utilizarmos outros operadores do RxJS para otimizar estas buscas.
Ao trocar o método chamado no botão (método click) para o input (método keyup), a busca é feita a cada letra digitada, gerando muitas requisições á API.
Por isso, será utilizada outar abordagem onde a busca só e feita uma vez assim que o usuário deixa de digitar.
Para isso utilizaremos um formControl para para referenciar o campo de busca da aplicação:

```typescript
...
campoBusca = new FormControl()
...
livrosEncontrados$ = this.campoBusca.valueChanges.pip()
```

```html
<input
    type="search"
    [formControl]="campoBusca"
>
<button>
  <img src="assets/imagens/icone-busca.png" alt="Lupa de cor roxa">
</button>
```

Observe que foi utilizado o símbolo de cifrão ($) no final da variável livrosEncontrados. 
Esta prática é adotada no Angular quando a variável é do tipo **Observable**, já que o formControl retorna um observable.
Como o valueChanges retorna um Observable, podemos utilizar os operadores do RxJS para manipular essas informações, então usaremos o método pipe().


### Operador switchMap

Agora precisamos modificar o campo de busca, e para isso usaremos o operador **switchMap()**. 
Este operador é responsável por fazer uma transformação, porém, diferentemente do map(), o switchMap() cancela todas as requisições anteriores.
A ideia desse operador é trocar os valores e passar ao servidor só o último valor, desconsiderando os valores anteriores.
Ainda usaremos o método map() para fazermos a transformação dos dados como era feito no buscarLivros().

```typescript
livrosEncontrados$ = this.campoBusca.valueChanges.pipe(
    switchMap(valorDigitado => this.service.buscar(valorDigitado)),
    map(items => this.listaLivros = this.livrosResultadoParaLivros(items))
)
```

Como livrosEncontrados$ é um observable, é necessário se inscrever nele. Para fazer isso diretamente no template, é possível utilizar o **Pipe Async** do Angular.
O **Pipe Async** possui os métodos subscriber (inscrever) e unsubscriber (desinscrever).

```html
<!-- Você pode utilizar de duas maneiras: Assim... -->
<div *ngIf="livrosEncontrados | async, else telaInicial">...</div>

<!-- ou assim... -->
<div *ngIf="livrosEncontrados$ | async as listaLivros, else telaInicial">...</div>
```

Quando o componente for encerrado, o **| async** fará o usubscriber automaticamente, sem precisarmos nos preocupar com isso.

Assim, o código-fonte final do componente não precisará mais se preocupar com o usubscriber, podendo ser refatorado para isto:

```typescript
import { Component} from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import { Item, Livro } from 'src/app/models/interfaces';
import { LivroVolumeInfo } from 'src/app/models/livroVolumeInfo';
import { LivroService } from 'src/app/service/livro.service';

@Component({
  selector: 'app-lista-livros',
  templateUrl: './lista-livros.component.html',
  styleUrls: ['./lista-livros.component.css']
})
export class ListaLivrosComponent {
  
  campoBusca = new FormControl()  

  constructor(private service: LivroService) { }

  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
        switchMap(valorDigitado => this.service.buscar(valorDigitado)),
        map(items => this.livrosResultadoParaLivros(items))
    )  

  livrosResultadoParaLivros(items: Item[]): LivroVolumeInfo[] {
    return items.map(item => {
      return new LivroVolumeInfo(item)
    })
  }
}
```

### Operadores filter e debounceTime

Até este momento, se o usuário digitar apenas uma letra no campo de busca, a aplicação fará a busca pela letra "a", trazendo um resultado muito genérico.
Pensando nisso, podemos otimizar ainda mais essa busca usando o RxJS e diminuindo ainda mais o número de requisições feitas ao servidor.
Para isso utilizaremos um operador RxJS chamado **filter**, que é similar ao método filter, que utilizamos no JavaScript, onde passamos uma condição que, se for satisfeita, o fluxo segue.
Precisamos escrever o operador antes do switchMap() porque, nesse caso, a ordem dos operadores influencia, alterando o resultado. 

```typescript
  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
        filter(valorDigitado => valorDigitado.length >= 3),
        switchMap(valorDigitado => this.service.buscar(valorDigitado)),
        map(items => this.livrosResultadoParaLivros(items))
    ) 
  
}
```

Perceba que se o usuário demorar para digitar a palavra, buscas intermediárias será realizadas trazendo resultados que não é o que o usuário quer. 
Isso ocorre porque o delay para cancelar uma requisição é muito pequeno. O RxJS possui um operador para manipularmos este delay da requisição, o **DebounceTime**

```typescript
  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
        debounceTime(3000), // parâmetro em milissegundos
        filter(valorDigitado => valorDigitado.length >= 3),
        switchMap(valorDigitado => this.service.buscar(valorDigitado)),
        map(items => this.livrosResultadoParaLivros(items))
    ) 
  
}
```

## Lidando com erros no RxJS

O RxJS possui operadores que auxiliam nas tarefas relacionadas a tratamento de erros. São elas: **catchError** e **throwError**.
O operador ***catchError()*** é responsável por capturar erros na aplicação (se houver). Ele espera receber entre seus parênteses um parâmetro erro.
O catchError() não emite valores, apenas o captura. Por isso, precisamos nos inscrever em outro Observable, o ***throwError()***. 
O throwError() retorna um novo Observable que emite imediatamente o erro e encerra o seu ciclo de vida.

```typescript
  mensagemErro = '';
  ...
  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
        debounceTime(3000),
        filter(valorDigitado => valorDigitado.length >= 3),
        switchMap(valorDigitado => this.service.buscar(valorDigitado)),
        map(items => this.livrosResultadoParaLivros(items)),
        catchError(erro => {
            console.log(erro)
            return throwError(() => new Error(this.mensagemErro = 'Ops, ocorreu um erro. Recarregue a aplicação!'))
        })
    )   
}
```

```html  
  <div class="resultados mensagem-erro" *ngIf="mensagemErro">
      {{ mensagemErro }}
  </div>
}
```

Outra abordagem possível caso não precise da mensgaem de texto retornada pela busca na API:

```typescript
  mensagemErro = '';
  ...
  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
        debounceTime(3000),
        filter(valorDigitado => valorDigitado.length >= 3),
        switchMap(valorDigitado => this.service.buscar(valorDigitado)),
        map(items => this.livrosResultadoParaLivros(items)),
        catchError(() => {
          this.mensagemErro = 'Ops, ocorreu um erro. Recarregue a aplicação!'
          return EMPTY              
        })
    )   
}
```

O **EMPTY** cria um Observable simples que não emite nenhum item para o Observer e que emite imediatamente uma notificação de "Complete" para encerrar o seu ciclo de vida. 
Por esse motivo é necessário recarregar a aplicação quando esse erro ocorre. Vimos que os métodos error e complete encerram o ciclo de vida do Observable. O mesmo ocorre com o catchError.
