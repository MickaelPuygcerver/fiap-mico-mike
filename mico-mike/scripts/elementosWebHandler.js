function criaElemento(tipo, texto) {
    var elemento = document.createElement(tipo)
    if (texto.value != "" || texto.value != null || texto.value != undefined) {
        elemento.innerHTML = texto;
    }
    return elemento;
}

function criaMenuEInstrucoes() {
    var divContainer = document.createElement("div");
    
    var divMenu = document.createElement("div");
      
    divMenu.appendChild(criaElemento("h2", "Mico-Mike"));
    divMenu.appendChild(criaElemento("p", "Ajude Mico-Mike e seus amigos em épicos desafios"));
    divMenu.appendChild(criaElemento("p", "Torne-se um grande aventureiro junto com eles"));
    divMenu.appendChild(criaElemento("p", "Será que você consegue ajuda-los?"));
    
    divMenu.appendChild(criaElemento("h2", "Como Jogar?"));
    divMenu.appendChild(criaElemento("p", "Seu objetivo é ficar o maior tempo possível vivo"));
    divMenu.appendChild(criaElemento("p", "Pule os obstáculos para você não perder"));
    divMenu.appendChild(criaElemento("p", "Para Pular toque na tela ou aperte o Espaço (⎵)"));

    divContainer.appendChild(divMenu); 
    divContainer.setAttribute("class", "container");
    
    document.body.appendChild(divContainer);
}

function atualizaElementoCanvas() {
    var canvas = document.getElementsByTagName('canvas');
}