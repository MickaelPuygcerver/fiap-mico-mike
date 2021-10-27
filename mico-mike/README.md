# mico-mike

O jogo contém:

* Manual do Jogo
  - HTML (Reutiliza o index.html e situa-se ao lado direito do game)

* Tela de Menu Principal
  - Função de Início (Inicia o jogo ao clicar)

* Tela de Gameplay
  - Jogabilidade (movimentação jogador e plataforma)
  - Física (arcade)
  - Pontuação (baseado por segundo passado)
  - Níveis de dificuldade (level 1,2,3,4..)
  - Colisão (plataforma e troncos)
  - Obstáculos (troncos)
  - Aleatoriedade (dimensao dos troncos)
  - Função de GameOver (ao colidir com tronco)
  - Animação de GameOver (jogador fica vermelho e para de se movimentar)

* Tela de Game Over
  - Função de Restart (Ao clicar na tela de game over o jogo volta ao menu principal. E se clicar uma segunda vez o jogo começa novamente)

* Phaser 3
  - Carregado no index.html (<script src="//cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>)