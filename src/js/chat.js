/* ===================== ajuda: assistente que tira dúvidas ===================== */
//#if app
const APP_VER="v0.15 beta";
//#else
const APP_VER="v0.13.3 beta";
//#endif
/* novidades de cada versão: a mais nova primeiro. Ao publicar uma versão, acrescente um item aqui e mude APP_VER */
const CHANGES=[
//#if app
  {v:"v0.15 beta",items:["Modelos da comunidade, primeira parte: em ⋯ → Minha conta há a opção Ajudar a melhorar os modelos. Ela vem desligada.","Ligada, o app manda uma cópia sem identificação só do formato dos seus móveis (medidas, vãos, portas, gavetas, puxador e cor). Não vai nome, cliente, preço, telefone, foto nem a sua conta.","Os melhores formatos, revisados um a um, vão virar modelos prontos no botão Móvel."]},
  {v:"v0.14.1 beta",items:["Puxador cava no 3D: agora aparece como uma faixa escura e limpa no alto da gaveta ou na borda da porta, sem os riscos que piscavam na frente."]},
//#else
  {v:"v0.13.3 beta",items:["Puxador cava no 3D: agora aparece como uma faixa escura e limpa no alto da gaveta ou na borda da porta, sem os riscos que piscavam na frente."]},
//#endif
//#if app
  {v:"v0.14 beta",items:["Inteligência no app: com a conta entrada, o chat de ajuda responde com a IA do Google (Gemini), com base no guia do AutoMarcen.","Croqui por foto também no app: em Móvel, tire uma foto do desenho no papel e a IA monta o móvel com as medidas. Confira sempre antes de cortar.","Falar ou escrever entende frases com vários móveis quando há internet e a conta está entrada.","Cada conta tem até 50 pedidos de IA por dia. Sem conta ou sem internet, o chat responde pelo guia e Falar ou escrever entende as frases simples no aparelho."]},
//#endif
  {v:"v0.13.2 beta",items:["Cor do móvel mais fácil de trocar: ao tocar num móvel no celular, o cartão tem o botão Cor, que abre direto nos acabamentos.","No desenho, o móvel mostra a cor escolhida mais forte, também enquanto está selecionado. Antes ele ficava apagado e parecia que a cor não tinha mudado.","Com vários móveis selecionados, dá para trocar o acabamento da caixa e das frentes de todos de uma vez. O antigo Cor desses casos agora se chama Cor das linhas, porque muda só o traço."]},
  {v:"v0.13.1 beta",items:["Tela limpa para quem começa: o primeiro projeto abre vazio, sem móveis de exemplo. Os modelos prontos e os conjuntos continuam no botão Móvel.","Com o projeto vazio, o meio da tela mostra por onde começar.","Os projetos que você já tinha continuam como estavam."]},
  {v:"v0.13 beta",items:["Preços em branco: os projetos novos não vêm mais com preços de exemplo, porque cada região tem um valor. Preencha chapas e ferragens com os preços dos seus fornecedores na aba Orçamento.","O último preço que você digitou de cada item fica guardado neste aparelho, e os próximos projetos já começam com ele.","Enquanto faltar algum preço, o Orçamento mostra o aviso Faltam preços, marca os campos vazios e o total aparece como incompleto. Antes de gerar o PDF, copiar o resumo ou mandar o 3D para o cliente, o AutoMarcen avisa.","Os projetos que você já tinha continuam com os preços que estavam neles."]},
  {v:"v0.12 beta",items:["Clientes e relatórios: no botão ⋯, veja quanto foi orçado e vendido por cliente, por mês e quantas chapas de cada material você usou. Toque num cliente para ver os orçamentos dele e num projeto para abri-lo.","Exportar tudo: no mesmo lugar, um arquivo .json com todos os clientes, projetos, orçamentos e materiais, para guardar uma cópia de segurança.","No app instalado pelo site: entre na sua conta AutoMarcen (botão ⋯ → Entrar na conta), com Google ou e-mail, e seus projetos aparecem no celular, no tablet e no computador."]},
  {v:"v0.11 beta",items:["Tela mais fácil de usar com o dedo no celular: o nome do projeto aparece inteiro, o Salvar mostra o texto e Aparência, Exportar e o Guia ficam no botão ⋯ do topo.","Abas Desenho, 3D, Peças e corte e Orçamento mais altas e com letra maior.","GRADE, OBJ, ORTO e os outros ficam numa linha só embaixo do desenho, que desliza para o lado. Desfazer e refazer ficam no começo dessa linha, perto do dedo.","Ao tocar num móvel, sobe um cartão com o nome e as medidas: dá para mudar largura, altura e profundidade ali mesmo, ou tocar em Editar para ver tudo.","Cores, Fina/Média/Grossa e cm/mm do painel ficaram no tamanho do dedo, e no tablet a coluna de ferramentas não mostra mais as letras de atalho."]},
  {v:"v0.10 beta",items:["Nome novo: o Croqui 3D agora se chama AutoMarcen. Seus projetos salvos, o seu WhatsApp e as suas preferências continuam como estavam."]},
  {v:"v0.9 beta",items:["Croqui por foto: em Móvel, tire uma foto do desenho no papel e o Claude monta o móvel com as medidas.","Falar ou escrever: em Móvel, diga “balcão de 147 por 60 com duas portas e três gavetas” e o móvel aparece pronto.","Cliente aprova pelo celular: com o seu WhatsApp no Orçamento, o PDF e o novo 3D para o cliente vêm com os botões Aprovar e Pedir ajuste. A situação de cada orçamento aparece na lista de Projetos."]},
  {v:"v0.8 beta",items:["Porta sobre gavetas no mesmo vão e portas de correr (2 ou 3 folhas). No vão, escolha o tipo em Editar. Há também o modelo Roupeiro de correr.","Novos móveis prontos: balcão gaveta+porta, cômoda, escrivaninha e os conjuntos Cozinha completa (com torre quente) e Painel de TV.","Plano de corte melhor: respeita o veio do MDF, testa várias arrumações e mostra as sobras aproveitáveis em verde.","Furação na aba Peças e corte: furos de dobradiça em cada porta, linha das corrediças e padrão de cavilhas.","Puxador à escolha (barra, botão, perfil, cava ou toque) e 8 novas cores de MDF; as madeiradas aparecem com veio no 3D.","Modo escuro e letras maiores: toque no botão de meia-lua no topo."]},
  {v:"v0.7 beta",items:["Se a internet cair com a ferramenta aberta, dá para continuar desenhando, ver o 3D, as peças e o orçamento. O botão mostra “Sem internet” e o projeto fica salvo no aparelho; quando a conexão volta, ele vai sozinho para a sua conta.","Sem internet, o chat de ajuda responde com o guia guardado na ferramenta."]},
  {v:"v0.6 beta",items:["Aviso de novidades: depois de cada atualização, esta janela mostra uma vez o que mudou. Para ver de novo, toque na versão no fim da lista de Projetos."]},
  {v:"v0.5 beta",items:["Chat de ajuda: toque no balão laranja no topo e escreva sua dúvida do seu jeito. Ele ensina o passo a passo e tem atalhos para os botões.","A ferramenta abre mais rápido: o 3D e o PDF carregam em segundo plano, então os botões respondem logo."]}
];
const SEEN_KEY="croqui3d-versao-vista";
function showNews(since){
  const idx=since?CHANGES.findIndex(c=>c.v===since):-1, list=idx>0?CHANGES.slice(0,idx):idx===0?CHANGES.slice(0,1):CHANGES.slice(0,2);
  dlg(`<h2>Novidades do AutoMarcen</h2><p>Versão ${esc(APP_VER)}</p>
    ${list.map(c=>`<div class="grp"><span class="lb">${esc(c.v)}</span><ul class="steps" style="color:var(--fg)">${c.items.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`).join("")}
    <div class="row act"><button class="btn ghost" data-chat>Tirar dúvidas</button><button class="btn pri" data-ok>Entendi</button></div>`,el=>{
    $("[data-ok]",el).onclick=closeDlg; $("[data-chat]",el).onclick=()=>{closeDlg(); openHelp()};
  },"news");
}
function checkNews(){
  if(!LS) return; // sem armazenamento não dá para lembrar: não mostra, para não repetir toda vez
  const seen=lsGet(SEEN_KEY);
  if(seen===APP_VER) return;
  const veteran=!!seen||!!lsGet(KEY)||!!lsGet(OLD_KEY);
  lsSet(SEEN_KEY,APP_VER);
  if(!veteran) return; // quem abre pela primeira vez não precisa da lista de mudanças
  const tryShow=(n)=>{ if(openDlg||H.open){ if(n<20) setTimeout(()=>tryShow(n+1),1500); return } showNews(seen) };
  setTimeout(()=>tryShow(0),900);
}
const GUIDE_URL="https://claude.ai/artifact/LoxsKJPStynxu7bheZw574";
/* base de conhecimento: o conteúdo do Guia do AutoMarcen, em perguntas. Serve de fonte para o Claude e para a busca sem internet */
const KB=[
 {id:"comecar",q:"Por onde eu começo?",k:"comecar inicio primeiro projeto novo criar usar ferramenta como funciona vazio tela em branco limpa exemplo modelo",go:"projetos",
  a:"O primeiro projeto começa vazio. Há dois jeitos de fazer um móvel:\n1. **Móvel pronto**: toque em **Móvel** na barra de ferramentas, escolha o modelo e digite as medidas.\n2. **Desenhar e gerar**: desenhe a frente do móvel com **Retângulo** e **Linha**, selecione o contorno e toque em **Gerar móvel**.\nPara um projeto novo, toque no nome do projeto no topo e depois em **+ Novo projeto**. Linhas soltas ficam só no desenho: para ter 3D, peças e orçamento, o desenho precisa virar móvel."},
 {id:"inserir",q:"Como insiro um móvel pronto?",k:"inserir modelo pronto balcao aereo gaveteiro armario roupeiro estante comoda escrivaninha cozinha completa painel tv rack torre quente modulo livre adicionar movel",go:"inserir",
  a:"1. Toque em **Móvel** na barra de ferramentas e escolha o modelo: balcão, aéreo, gaveteiro, armário, roupeiro, estante, balcão gaveta+porta, roupeiro de correr, cômoda, escrivaninha ou módulo livre.\n2. Digite largura, altura e profundidade em centímetros.\n3. Em **Altura do piso**, deixe 0 para móveis no chão. Num aéreo, use a distância do chão até a base dele, por exemplo 150.\n4. Toque em **Inserir**. O móvel aparece ao lado dos outros, já cotado.\nNo fim da lista há conjuntos prontos: **Cozinha completa** (balcão, aéreo e torre quente) e **Painel de TV** (rack e painel). Depois toque em cada móvel e em **Editar** para ajustar."},
 {id:"gerar",q:"Como transformo meu desenho em móvel 3D?",k:"gerar movel desenho transformar converter croqui virar 3d contorno desenhar armario",
  a:"1. **Contorno**: toque em **Retângulo**, toque no canto de baixo à esquerda em cima da linha PISO 0,0, digite as medidas como `150x90` e confirme com Enter.\n2. **Divisões e gavetas**: com **Linha**, uma linha vertical de cima a baixo vira divisória; linhas horizontais dentro de um vão viram gavetas; uma linha de lado a lado até 20 cm do chão vira rodapé. Deixe **OBJ** ligado para as pontas grudarem no contorno.\n3. **Gerar**: toque em **Selecionar**, toque na borda do contorno e depois em **Gerar móvel**.\n4. **Conferir**: a janela mostra o que foi entendido. Informe a profundidade e toque em **Gerar móvel**. Se o resumo não bater, toque em Cancelar e corrija as linhas."},
 {id:"regras",q:"Por que o móvel saiu diferente do desenho?",k:"diferente errado nao reconheceu ignorou linha torta curta gerar regras saiu porta dupla",
  a:"O móvel sai igual ao desenho quando:\n- O contorno é um retângulo ou quatro linhas fechadas.\n- A divisória é uma linha vertical que atravessa quase toda a altura.\n- Gavetas são linhas horizontais dentro de um vão.\n- Vão vazio até 65 cm vira **porta**; com mais de 65 cm vira **porta dupla**.\nO que atrapalha: linha curta que não encosta no contorno (ligue **OBJ**), linha torta com mais de 4 graus (ligue **ORTO**), traço do **Lápis**, e dois móveis no mesmo contorno (gere um de cada vez). Depois de gerado, dá para corrigir tudo no painel do móvel."},
 {id:"linha",q:"Como desenho uma linha com medida exata?",k:"linha medida exata comprimento angulo digitar 147 graus reta desenhar",
  a:"1. Toque em **Linha** e toque no ponto de início.\n2. Digite o comprimento no campo do topo, por exemplo `147`, e confirme com Enter. Para escolher o ângulo, use `147<90` (90 = para cima, 0 = para a direita).\n3. Continue digitando para fazer linhas emendadas.\n4. Toque em **Concluir** para parar, ou **Fechar** para ligar a última ponta na primeira.\nVírgula e ponto funcionam (12,5 ou 12.5)."},
 {id:"retangulo",q:"Como desenho um retângulo com medida?",k:"retangulo medida largura altura 60x80 quadrado caixa desenhar",
  a:"Toque em **Retângulo**, toque no primeiro canto e digite largura x altura no campo do topo, por exemplo `60x80`, e confirme com Enter. Também dá para tocar no canto oposto. Com o retângulo selecionado, o painel mostra largura, altura e área, que podem ser corrigidas."},
 {id:"circulo",q:"Como desenho um círculo?",k:"circulo raio diametro redondo furo",
  a:"Toque em **Círculo**, toque no centro e digite o raio, por exemplo `30`. Para usar o diâmetro, digite d antes do número: `d60`."},
 {id:"cota",q:"Como coloco uma cota?",k:"cota medida dimensao cotar mostrar tamanho",
  a:"1. Toque em **Cota**.\n2. Toque no primeiro e no segundo ponto da medida.\n3. Arraste para afastar a linha de cota do desenho e toque para confirmar (ou digite o afastamento).\nOs móveis já vêm com cotas automáticas. Para tirar, use **Sem cotas** no painel do móvel."},
 {id:"texto",q:"Como escrevo um texto no desenho?",k:"texto escrever anotacao observacao legenda nome",
  a:"Toque em **Texto**, toque onde o texto vai ficar, escreva e toque em **Adicionar**. Para mudar depois, selecione o texto e edite no painel."},
 {id:"medir",q:"Como meço uma distância?",k:"medir distancia regua conferir tamanho",
  a:"Toque em **Medir** e toque nos dois pontos. A medida aparece na tela com a distância e as diferenças na horizontal e na vertical. Nada é desenhado."},
 {id:"apagar",q:"Como apago ou desfaço algo?",k:"apagar excluir deletar desfazer refazer errei voltar remover borracha",
  a:"- **Desfazer** e **Refazer**: as setas curvas no topo. No celular, ficam no começo da linha de botões embaixo do desenho.\n- **Apagar**: toque na ferramenta e toque ou arraste sobre o que quer apagar.\n- Ou selecione o objeto e toque em **Excluir** na barra que aparece embaixo.\nDepois de apagar, toque em **Selecionar** para voltar a mexer nos objetos."},
 {id:"selecionar",q:"Como seleciono e movo objetos?",k:"selecionar mover arrastar varios selecao area duplicar girar pegar",
  a:"Toque em **Selecionar** e toque perto da linha ou do móvel. Arraste para mover. Para pegar vários, arraste num espaço vazio: da esquerda para a direita pega o que está todo dentro, e da direita para a esquerda pega o que a área encostar. Com algo selecionado aparecem **Duplicar**, **Girar** e **Excluir**."},
 {id:"encaixe",q:"O que são GRADE, OBJ e ORTO?",k:"grade obj orto encaixe snap grudar ortogonal quadrado escala 5cm",
  a:"São os botões da barra de baixo:\n- **GRADE**: os pontos grudam na grade.\n- **OBJ**: os pontos grudam nas pontas, meios e centros dos desenhos.\n- **ORTO**: só linhas retas, na horizontal ou vertical.\n- **□ 5 cm**: o tamanho de cada quadrado da grade (1, 5 ou 10 cm).\n- **INTERNO**: mostra o interior dos móveis, com as portas tracejadas."},
 {id:"vista",q:"Como dou zoom e mexo a tela?",k:"zoom aproximar afastar mover tela vista enquadrar ajustar dedos pinça arrastar",
  a:"Use **dois dedos** para aproximar, afastar e arrastar a vista. **AJUSTAR** enquadra o desenho inteiro. A ferramenta **Mover vista** arrasta a tela com um dedo. No computador, a rodinha do mouse dá zoom."},
 {id:"vaos",q:"Como mudo portas, gavetas e vãos do móvel?",k:"vao vaos porta gaveta nicho painel editar mudar largura quantidade prateleira dividir",
  a:"Selecione o móvel e toque em **Editar**. Em **Vãos (esquerda → direita)**, cada linha é um vão:\n- O primeiro campo é a largura interna. Vazio (auto) divide o espaço que sobra.\n- O tipo pode ser **Porta**, **Porta dupla**, **Gavetas**, **Porta sobre gavetas**, **Portas de correr** ou **Nicho aberto**.\n- O último campo é a quantidade de gavetas, ou de prateleiras nas portas e nichos.\n- **+ Adicionar vão** cria mais uma divisão, e o X remove."},
 {id:"dobradica",q:"Como escolho o lado da dobradiça?",k:"dobradica lado esquerda direita abrir porta simples",
  a:"Numa porta simples, o painel do móvel mostra **Dobradiça do lado** com **E** (esquerda) e **D** (direita). A porta dupla já abre para os dois lados."},
 {id:"interior",q:"Como monto o interior com cabideiro e gavetas?",k:"interior cabide cabideiro gavetas internas maleiro prateleira roupeiro zona dentro",
  a:"1. Selecione o móvel e toque em **Editar**.\n2. No vão com porta, toque em **Editar interior**.\n3. Escolha um modelo pronto (Roupeiro, Cabide longo, Cabide duplo, Gavetas + prateleiras, Só prateleiras) ou ajuste as zonas. **+ Zona no topo** acrescenta mais uma.\nCada zona tem tipo, altura e quantidade. Prateleiras com 0 deixam o espaço livre (maleiro, no topo). O tubo de cabide fica 6 cm abaixo do topo da zona; para cabide, use 55 cm de profundidade ou mais. Toque em **INTERNO** para ver o interior no desenho."},
 {id:"acabamento",q:"Como mudo a cor do MDF?",k:"cor acabamento mdf branco carvalho grafite preto freijo nogueira madeira cores amendoa cinamomo tauari jequitiba veio textura",
  a:"Selecione o móvel e toque em **Cor**, no cartão que sobe (ou em **Editar** e desça até o fim). Escolha em **Acabamento da caixa** e **Acabamento das frentes**. Com vários móveis selecionados, a cor escolhida vale para todos. Em **Cor das linhas** muda só o traço do desenho, não o MDF. São 18 cores de MDF, entre lisas (Branco TX, Grafite, Areia…) e madeiradas (Carvalho, Freijó, Nogueira, Amêndoa, Cinamomo, Tauari, Jequitibá). As madeiradas aparecem com veio no 3D. Os nomes são aproximados: confira o padrão no catálogo do seu fornecedor."},
 {id:"puxador",q:"Como escolho o puxador?",k:"puxador botao barra perfil cava toque fecho sem puxador alca",
  a:"Selecione o móvel, toque em **Editar** e, em **Puxador**, escolha **Barra**, **Botão**, **Perfil** (alumínio na borda, cobrado por metro), **Cava** (usinada na frente, sem ferragem) ou **Toque** (sem puxador, com fecho toque). O desenho, o 3D e o orçamento mudam juntos. O preço de cada tipo fica em **Orçamento**, em Ferragens."},
 {id:"aereo",q:"Como coloco um armário aéreo na altura certa?",k:"aereo altura piso parede suspenso pendurado elevar",
  a:"Ao inserir, use **Altura do piso** com a distância do chão até a base do aéreo, por exemplo 150. Se o móvel já existe, selecione, toque em **Editar** e mude **Altura do piso** em Dimensões externas."},
 {id:"rodape",q:"Como coloco ou tiro o rodapé?",k:"rodape base chao altura do rodape",
  a:"Selecione o móvel, toque em **Editar** e mude **Rodapé** em Dimensões externas (0 tira o rodapé). No desenho, uma linha de lado a lado entre 3 e 20 cm do chão vira rodapé ao gerar o móvel."},
 {id:"tresd",q:"Como vejo o móvel em 3D?",k:"3d ver girar rodar portas gavetas vista frente topo tridimensional",go:"3d",
  a:"Toque na aba **3D**. Arraste com um dedo para girar e use dois dedos para aproximar. **Frente**, **3/4** e **Topo** mudam a vista, e **Abrir portas e gavetas** mostra o interior. Se aparecer o aviso de linhas na parede, use **Gerar do desenho** para transformar o desenho em móvel."},
 {id:"pecas",q:"Onde vejo a lista de peças e o plano de corte?",k:"pecas lista corte plano chapa serra refilo esquadrejadeira aproveitamento fita borda ferragens veio sobra retalho",go:"pecas",
  a:"Na aba **Peças e corte**. A lista vem em milímetros, com fita de borda, ferragens e o número de chapas de cada material. Ajuste o tamanho da chapa, a espessura da serra e o refilo ao seu fornecedor.\n- Marque **respeitar o veio** nos materiais madeirados: as peças não giram e o comprimento segue o veio da chapa.\n- O plano testa várias arrumações e fica com a que usa menos chapas e deixa a maior sobra inteira.\n- Sobras aproveitáveis (a partir de 30 × 15 cm) aparecem tracejadas em verde, com a medida."},
 {id:"furacao",q:"Onde vejo a furação das peças?",k:"furacao furo furar caneco dobradica 35 corredica sistema 32 cavilha minifix broca",go:"pecas",
  a:"Na aba **Peças e corte**, no quadro **Furação**:\n- **Portas**: desenho de cada porta com os furos de caneco Ø35 mm, a 22,5 mm da borda, e a altura de cada furo.\n- **Corrediças**: altura da linha de furos em cada lateral, a 37 mm da frente e a cada 32 mm.\n- **Cavilhas e minifix**: o padrão das junções de laterais, tampo e base."},
 {id:"orcamento",q:"Como faço o orçamento?",k:"orcamento preco valor custo margem mao de obra total cliente cobrar",go:"orcamento",
  a:"Na aba **Orçamento**, informe o preço das chapas, das ferragens, da mão de obra, da instalação e a margem. Os preços vêm **em branco** porque cada região tem um valor: use os dos seus fornecedores. O último preço que você digitou de cada item fica guardado no aparelho e já vem nos próximos projetos. Enquanto faltar preço, aparece o aviso **Faltam preços**, os campos vazios ficam marcados e o total sai como incompleto. O total é calculado sozinho a partir das peças."},
 {id:"precos-zerados",q:"Por que os preços estão zerados?",k:"preco zerado zero branco vazio sem preco faltam precos regiao fornecedor exemplo total incompleto R$ 0",go:"orcamento",
  a:"Os preços de chapas e ferragens vêm **em branco** porque mudam muito de uma região para outra. Abra a aba **Orçamento** e preencha com os preços dos seus fornecedores. Você só faz isso uma vez: o último preço de cada item fica guardado no aparelho e os próximos projetos já começam com ele. Os projetos antigos continuam com os preços que tinham."},
 {id:"cliente",q:"Como mando o orçamento para o cliente aprovar?",k:"cliente mandar enviar pdf whatsapp resumo proposta compartilhar aprovar aprovacao link 3d situacao aprovado recusado",go:"orcamento",
  a:"Na aba **Orçamento**:\n1. Em **Seu WhatsApp**, coloque o seu número. Ele fica guardado.\n2. **Gerar PDF** cria a proposta com 3D, desenho e valores, e com os botões **Aprovar pelo WhatsApp** e **Pedir ajuste**.\n3. **3D para o cliente** salva um arquivo que o cliente abre no celular para girar o móvel, abrir as portas e tocar em **Aprovar**.\n4. **Copiar resumo** copia um texto curto para colar no WhatsApp.\nQuando o cliente responder, marque a **Situação do orçamento** (Enviado, Aprovado ou Recusado). Ela aparece na lista de Projetos."},
//#if app
 {id:"modelos",q:"O que é Ajudar a melhorar os modelos?",k:"ajudar melhorar modelos comunidade compartilhar enviar dados anonimo privacidade lgpd permissao desligar formato moveis",go:"conta",
  a:"É uma opção em **⋯ → Minha conta**, que vem **desligada**. Ligada, o app manda uma cópia **sem identificação** só do formato dos seus móveis: medidas, vãos, portas, gavetas, interior, puxador e cor. Com ela montamos modelos prontos melhores, que aparecem no botão **Móvel** depois de revisados um a um.\n**Não vai** nome do projeto ou do móvel, cliente, preço, telefone, foto nem a sua conta.\nPara parar, desmarque a opção: nada mais é enviado e o que saiu deste aparelho é apagado."},
//#endif
 {id:"foto",q:"Dá para montar o móvel a partir de uma foto do croqui?",k:"foto croqui papel camera imagem tirar foto desenho a mao ler escanear",go:"inserir",
//#if app
  a:"Sim. Toque em **Móvel** e depois em **Croqui por foto**. Tire ou escolha a foto do desenho no papel, de frente, com boa luz e as medidas legíveis. A IA lê o croqui e mostra o que entendeu. Confira e toque em **Inserir no projeto**. Precisa de internet e de estar com a conta entrada (**⋯ → Entrar na conta**). Cada conta tem até 50 pedidos de IA por dia, somando chat, foto e frases. Sempre confira as medidas antes de cortar."},
//#else
  a:"Sim. Toque em **Móvel** e depois em **Croqui por foto**. Tire ou escolha a foto do desenho no papel, de frente, com boa luz e as medidas legíveis. O Claude lê o croqui e mostra o que entendeu. Confira e toque em **Inserir no projeto**. Precisa de internet e usa o seu uso do Claude. Sempre confira as medidas antes de cortar."},
//#endif
 {id:"voz",q:"Dá para ditar o móvel por voz?",k:"voz falar ditar ditado microfone audio escrever descrever frase",go:"inserir",
  a:"Sim. Toque em **Móvel** e depois em **Falar ou escrever**. Toque em **Falar** (ou use o microfone do teclado do celular) e diga, por exemplo: “balcão de 147 por 60 com duas portas e três gavetas” ou “aéreo de 120 por 70 a 150 do chão com duas portas”. Confira o que foi entendido e toque em **Inserir no projeto**. Frases simples funcionam até sem internet."},
 {id:"relatorios",q:"Onde vejo quanto vendi por cliente ou por mês?",k:"relatorio relatorios cliente clientes mes mensal vendido vendas faturamento total aprovado materiais chapas exportar tudo backup copia",go:"",
  a:"Toque em **⋯** no topo e depois em **Clientes e relatórios**:\n- **Clientes**: orçado e vendido de cada cliente. Toque num cliente para ver os orçamentos dele mês a mês.\n- **Por mês**: orçado e vendido (orçamentos aprovados) em cada mês.\n- **Materiais**: quantas chapas de cada material entraram nos projetos.\nO nome do cliente vem do campo **Nome do cliente**, na aba Orçamento, e o vendido vem da **Situação do orçamento** marcada como Aprovado.\n**Exportar tudo (.json)** salva um arquivo com todos os dados, como cópia de segurança."},
 {id:"exportar",q:"Quais formatos posso exportar?",k:"exportar baixar download dxf cad svg csv png imagem json arquivo zip",go:"exportar",
  a:"Toque na seta de **Exportar**, no topo (no celular, toque em **⋯** e depois em **Exportar**):\n- **Orçamento em PDF**: proposta para o cliente.\n- **Imagem da prancha**: desenho cotado para WhatsApp.\n- **Desenho CAD (DXF)**: vem dentro de um .zip, descompacte antes.\n- **Vetor (SVG)**: programas de desenho vetorial e navegador.\n- **Lista de peças (CSV)**: planilhas e otimizadores de corte.\n- **Projeto (.json)** e **Código do projeto**: cópia de segurança.\nCada download pede uma confirmação."},
 {id:"salvar",q:"Meu projeto está salvo?",k:"salvar salvo salvando nuvem verde disquete perder guardar",
//#if app
  a:"O projeto salva sozinho a cada mudança. O botão no topo mostra o estado:\n- **Nuvem verde, Salvo**: (versão do claude.ai) salvo na conta Claude do dono do link, aparece em todos os aparelhos.\n- **Salvo no aparelho**: salvo só neste aparelho. Na versão instalada é sempre assim; para levar a outro aparelho, use **Exportar → Projeto (.json)** e depois **Projetos → Importar**.\n- **Salvando…**: espere um instante.\n- **Não salvo** ou **Não salvou** (vermelho): veja a resposta sobre “Não salvo”.\nUm toque no botão salva na hora."},
//#else
  a:"O projeto salva sozinho a cada mudança. O botão no topo mostra o estado:\n- **Nuvem verde, Salvo**: salvo na conta Claude do dono do link, aparece em todos os aparelhos.\n- **Salvo no aparelho**: salvo só neste navegador.\n- **Salvando…**: espere um instante.\n- **Não salvo** ou **Não salvou** (vermelho): veja a resposta sobre “Não salvo”.\nUm toque no botão salva na hora."},
//#endif
 {id:"naosalvo",q:"Apareceu “Não salvo” em vermelho. O que faço?",k:"nao salvo vermelho anonimo bloqueado perdi sumiu nao salvou erro",
  a:"O navegador bloqueou o armazenamento (modo anônimo ou dados de sites bloqueados). Se fechar a página, o desenho se perde. Para guardar:\n1. Toque em **Não salvo** e depois em **Copiar código**.\n2. Cole o código no WhatsApp, num e-mail ou no bloco de notas.\n3. Para continuar depois, abra o link, toque em **Projetos → Importar**, cole o código e toque em **Importar código**.\nSe aparecer **Não salvou**, a conta não respondeu: toque no botão para tentar de novo."},
 {id:"aparelho",q:"Como levo o projeto para outro aparelho?",k:"outro aparelho celular tablet computador levar passar importar codigo compartilhar pessoa",go:"projetos",
  a:"Para o dono do link, o projeto já aparece sozinho nos outros aparelhos. Para outra pessoa: toque em **Exportar → Código do projeto**, copie e mande pelo WhatsApp. No outro aparelho, abra o link, toque em **Projetos → Importar**, cole o código e toque em **Importar código**."},
 {id:"projetos",q:"Como renomeio, duplico ou apago um projeto?",k:"projeto renomear duplicar copiar apagar excluir lista projetos nome",go:"projetos",
  a:"Toque no nome do projeto, no topo. Na lista aparecem os botões de **renomear** (lápis), **duplicar** e **excluir** de cada projeto, além de **+ Novo projeto** e **Importar**."},
 {id:"unidade",q:"Como trabalho em milímetros?",k:"milimetro mm centimetro cm unidade medida",
  a:"Com nada selecionado, o painel mostra **Unidades e grade**. Escolha **Centímetros** ou **Milímetros**. A lista de corte sempre sai em milímetros."},
 {id:"camadas",q:"Para que servem as camadas?",k:"camada camadas ocultar esconder travar layer",
  a:"No painel, a aba **Camadas** separa Estrutura, Móveis, Cotas, Anotações e Esboço. Toque no nome para desenhar nela, no olho para mostrar ou esconder e no cadeado para travar. **+ Nova** cria outra camada. No DXF, cada camada vira uma layer no programa de CAD."},
 {id:"limites",q:"Dá para fazer porta em cima de gaveta ou porta de correr?",k:"porta em cima de gaveta sobre correr deslizante folhas trilho",
  a:"Sim. Selecione o móvel, toque em **Editar** e, no vão, troque o tipo:\n- **Porta sobre gavetas**: o último campo é a quantidade de gavetas, que ficam embaixo. Em **Altura das gavetas** você define a altura do bloco (vazio = automático) e em **Folhas da porta** escolhe 1 ou 2.\n- **Portas de correr**: escolha 2 ou 3 folhas. O orçamento soma o kit de porta de correr por folha. No 3D, **Abrir portas e gavetas** desliza as folhas.\nHá também o modelo pronto **Roupeiro de correr** em **Móvel**."},
 {id:"app",q:"Como abro como aplicativo no celular?",k:"aplicativo app tela inicial instalar atalho icone chrome android",
  a:"No Chrome, toque em **⋮** e depois em **Adicionar à tela inicial**. O AutoMarcen passa a abrir como um aplicativo."},
 {id:"novidades",q:"O que mudou na última atualização?",k:"novidades atualizacao versao mudou novo novidade lancamento",
  a:"Depois de cada atualização aparece uma vez a janela **Novidades do AutoMarcen**. Para ver de novo, toque no nome do projeto no topo e, no fim da lista, toque na versão (**AutoMarcen · v0.6 beta · novidades**).\nNa v0.6 entrou esse aviso de novidades. Na v0.5 entraram o chat de ajuda e a abertura mais rápida."},
 {id:"offline",q:"Funciona sem internet?",k:"sem internet offline sinal conexao caiu obra desconectado wifi dados",
//#if app
  a:"Sim, na versão instalada (o app do AutoMarcen na tela inicial): depois de aberta uma vez com internet, ela abre e funciona sem sinal, e o projeto fica salvo no aparelho. Na versão do claude.ai, para **abrir** o link é preciso internet. Com a ferramenta já aberta, se a internet cair, dá para continuar desenhando, ver o 3D, as peças e o orçamento. O botão de salvar mostra **Sem internet** e o projeto fica salvo no aparelho; quando a conexão volta, ele vai sozinho para a sua conta.\nDica para a obra: abra a ferramenta antes de sair, ainda com sinal, espere uns segundos e não feche a aba. Sem internet não funcionam a IA do chat (ele responde pelo guia), o Croqui por foto, o link do guia e, possivelmente, os downloads."},
//#else
  a:"Em parte. Para **abrir** o link é preciso internet. Com a ferramenta já aberta, se a internet cair, dá para continuar desenhando, ver o 3D, as peças e o orçamento. O botão de salvar mostra **Sem internet** e o projeto fica salvo no aparelho; quando a conexão volta, ele vai sozinho para a sua conta.\nDica para a obra: abra a ferramenta antes de sair, ainda com sinal, espere uns segundos e não feche a aba. Sem internet não funcionam o chat com o Claude (ele responde pelo guia), o link do guia e, possivelmente, os downloads."},
//#endif
 {id:"aparencia",q:"Como deixo a tela escura ou as letras maiores?",k:"modo escuro tema claro noite letra maior grande tamanho fonte ler enxergar vista",
  a:"Toque no botão de meia-lua no topo (**Aparência**). No celular, ele fica dentro do botão **⋯**. Em **Tema**, escolha Automático, Claro ou Escuro. Em **Tamanho das letras**, escolha Normal, Grande ou Maior. Fica guardado neste aparelho."},
 {id:"tablet",q:"Dicas para usar no tablet",k:"tablet dedo toque dicas celular tela pequena barra ferramentas",
  a:"- A ferramenta escolhida continua ativa até você trocar. Depois de desenhar ou apagar, toque em **Selecionar**.\n- Para selecionar, toque perto da linha.\n- Em telas pequenas, deslize a barra de ferramentas para o lado para ver todas.\n- Ao tocar num móvel, sobe um cartão com as medidas. Mude largura, altura e profundidade ali, ou toque em **Editar** para ver tudo.\n- A linha com GRADE, OBJ e ORTO também desliza para o lado. **PAINEL**, no fim dela, abre as cores, a espessura e as camadas."}
];
const SUGS=["comecar","gerar","interior","cliente","naosalvo"];
const ACTS={inserir:["Inserir móvel",()=>{setView("draw"); showInsert()}],exportar:["Abrir Exportar",()=>showExport()],projetos:["Abrir Projetos",()=>showProjects()],
  "3d":["Ver o 3D",()=>setView("3d")],pecas:["Ver peças e corte",()=>setView("parts")],orcamento:["Abrir o orçamento",()=>setView("quote")],guia:["Abrir o guia",()=>open(GUIDE_URL,"_blank","noopener")]};
//#if app
ACTS.conta=["Abrir Minha conta",()=>showAcct()];
//#endif
const norm=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ");
const STOP=new Set("a o as os e de do da dos das em no na nos nas um uma uns umas para pra por com sem que como eu meu minha se nao sim ao aos onde qual quais quando porque por que ja mais muito tem ter fazer faco faz faco isso esse essa este esta e ou da dar consigo consegue posso pode quero preciso ele ela voce".split(" "));
const toks=s=>norm(s).split(/\s+/).filter(w=>w.length>1&&!STOP.has(w));
const stem=w=>w.length<4?w:w.replace(/eis$/,"el").replace(/(oes|aes)$/,"ao").replace(/ais$/,"al").replace(/s$/,"");
function kbSearch(text){
  const q=toks(text).map(stem); if(!q.length) return [];
  return KB.map(e=>{
    const K=toks(e.k).map(stem), Q=toks(e.q).map(stem), A=toks(e.a).map(stem); let s=0;
    for(const w of q){ if(K.some(x=>x===w)) s+=3; else if(w.length>=4&&K.some(x=>x.length>=4&&(x.startsWith(w)||w.startsWith(x)))) s+=2; if(Q.includes(w)) s+=2; if(A.includes(w)) s+=.5 }
    return {e,s:s/Math.sqrt(q.length)};
  }).filter(r=>r.s>=2).sort((a,b)=>b.s-a.s);
}
function mdLite(src){
  const inl=t=>esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/`([^`]+)`/g,"<code>$1</code>");
  const out=[]; let list=null;
  for(const raw of String(src).split("\n")){
    const ln=raw.trim(), m=ln.match(/^(\d+)[.)]\s+(.*)$/), b=ln.match(/^[-•*]\s+(.*)$/);
    if(m||b){const tag=m?"ol":"ul"; if(!list||list.tag!==tag){if(list) out.push(`</${list.tag}>`); list={tag}; out.push(`<${tag}>`)} out.push(`<li>${inl(m?m[2]:b[1])}</li>`); continue}
    if(list){out.push(`</${list.tag}>`); list=null}
    if(ln) out.push(`<p>${inl(ln.replace(/^#+\s*/,""))}</p>`);
  }
  if(list) out.push(`</${list.tag}>`);
  return out.join("");
}
function appContext(){
  const vn={draw:"Desenho","3d":"3D",parts:"Peças e corte",quote:"Orçamento"}[curView];
  const mods=P.items.filter(i=>i.t==="mod"), s=selItems(), names={line:"linha",rect:"retângulo",circle:"círculo",dim:"cota",text:"texto",free:"traço de lápis",mod:"móvel"};
  const ms=mods.slice(0,8).map(m=>`${m.name} ${fmtL(m.W)}×${fmtL(m.H)}×${fmtL(m.D)} ${P.unit} (${m.secs.map(x=>x.type==="gavetas"?`${x.n||3} gavetas`:SEC_TYPES[x.type].toLowerCase()).join(", ")})`).join("; ");
  const lines=P.items.filter(i=>i.t!=="mod").length;
  return `Aba aberta: ${vn}. Ferramenta: ${(TOOLS.find(t=>t[0]===tool)||[])[1]||tool}. Unidade: ${P.unit}. Botão Salvar mostra: "${saveState()[1]}". Projeto "${P.name}" com ${mods.length} móve${mods.length===1?"l":"is"}${ms?`: ${ms}`:""} e ${lines} outros objetos de desenho.${s.length?` Selecionado: ${s.length===1?names[s[0].t]:s.length+" objetos"}.`:" Nada selecionado."}`;
}
function rulesTurn(){
  const guide=KB.map(e=>`### ${e.q}\n${e.a}`).join("\n\n");
  return `Você é o assistente de ajuda dentro do AutoMarcen (${APP_VER}), uma ferramenta web de projeto de marcenaria feita para marceneiros: desenho técnico com cotas, móveis paramétricos, 3D, lista de peças, plano de corte e orçamento. Ela roda no celular, no tablet e no computador.

Como responder:
- Português do Brasil simples, como um colega de oficina explicando. Frases curtas. No máximo uns 120 palavras.
- Para ensinar, use passos numerados (1. 2. 3.). Escreva nomes de botões e abas em **negrito**, exatamente como aparecem.
- Use só o que está no GUIA abaixo e o ESTADO ATUAL. Não invente botões, menus ou funções. Se a ferramenta não faz algo, diga que ainda não faz e dê a alternativa do guia, se houver.
- Dúvidas de marcenaria em geral (medidas comuns, ferragens, MDF) podem ser respondidas com conhecimento geral, curto, ligando de volta ao que fazer na ferramenta.
- Se a pergunta não tiver relação com marcenaria nem com a ferramenta, diga com gentileza que só ajuda com o AutoMarcen.
- Não cite nomes de outros programas ou marcas de software (de desenho, CAD, planilha ou plano de corte). Fale de forma genérica, por exemplo "programa de CAD" ou "planilha".
- Quando ajudar, termine com UMA linha contendo só uma destas marcas para mostrar um botão de atalho: [abrir:inserir] [abrir:exportar] [abrir:projetos] [abrir:3d] [abrir:pecas] [abrir:orcamento] [abrir:guia]. Não explique a marca.

ESTADO ATUAL DA TELA DO USUÁRIO:
${appContext()}

GUIA DO AUTOMARCEN:
${guide}`;
}
const H={open:false,turns:[],busy:false,ctl:null,sample:null,mode:"try"}; // mode: try | ai | local
const hLog=$("#hLog"), hIn=$("#hIn");
//#if app
H.sample=IA;
function updMode(){$("#hMode").textContent=H.mode==="ai"?"Respostas da IA (Gemini), com base no guia":H.mode==="local"?"Respostas do guia do AutoMarcen":"Pergunte como fazer qualquer coisa no AutoMarcen"}
//#else
(async()=>{try{H.sample=window.claude&&window.claude.use?await window.claude.use("sample"):null}catch(_){H.sample=null} if(!H.sample) H.mode="local"; updMode()})();
function updMode(){$("#hMode").textContent=H.mode==="ai"?"Respostas do Claude, com base no guia":H.mode==="local"?"Respostas do guia do AutoMarcen":"Pergunte como fazer qualquer coisa no AutoMarcen"}
//#endif
function openHelp(){
  H.open=true; const h=$("#help"); h.classList.add("open"); h.setAttribute("aria-hidden","false"); $("#bChat").setAttribute("aria-expanded","true");
  if(!hLog.children.length) helpWelcome();
  if(matchMedia("(pointer:fine)").matches) setTimeout(()=>hIn.focus(),60);
}
function closeHelp(){H.open=false; const h=$("#help"); h.classList.remove("open"); h.setAttribute("aria-hidden","true"); $("#bChat").setAttribute("aria-expanded","false"); hIn.blur()}
let scrollQ=0; function scrollLog(){if(scrollQ) return; scrollQ=requestAnimationFrame(()=>{scrollQ=0; hLog.scrollTop=hLog.scrollHeight})}
function addMsg(who,html){const d=document.createElement("div"); d.className="msgb "+who; d.innerHTML=html; hLog.appendChild(d); scrollLog(); return d}
function sugHTML(ids){return `<div class="hsug">${ids.map(id=>{const e=KB.find(x=>x.id===id); return e?`<button class="pill" data-hq="${id}">${esc(e.q)}</button>`:""}).join("")}</div>`}
function helpWelcome(){
  addMsg("bot",mdLite("Olá! Eu explico como usar o AutoMarcen. Escreva sua dúvida do seu jeito, por exemplo “como faço um roupeiro com gavetas?”, ou toque numa pergunta:")+sugHTML(SUGS));
}
function actsHTML(keys){keys=[...new Set(keys)].filter(k=>ACTS[k]); return keys.length?`<div class="hacts">${keys.map(k=>`<button class="btn sm" data-hgo="${k}">${ACTS[k][0]}</button>`).join("")}</div>`:""}
function localAnswer(text,el,note){
  const r=kbSearch(text);
  let html;
  if(!r.length) html=mdLite("Não achei isso no guia. Tente com outras palavras, ou veja estas perguntas:")+sugHTML(SUGS)+actsHTML(["guia"]);
  else{
    const best=r[0].e, more=r.slice(1,4).filter(x=>x.s>=r[0].s*.5).map(x=>x.e.id);
    html=`<p><b>${esc(best.q)}</b></p>`+mdLite(best.a)+actsHTML([best.go,"guia"].filter(Boolean))+(more.length?`<p class="src" style="margin-top:10px">Talvez ajude também:</p>`+sugHTML(more):"");
  }
  if(note) html+=`<span class="src">${esc(note)}</span>`;
  el.innerHTML=html; scrollLog();
  H.turns.push({role:"assistant",content:r.length?r[0].e.a:"Não achei no guia."});
}
function renderAI(text,el,final){
  const keys=[]; const clean=String(text).replace(/\[abrir:([a-z0-9]+)\]/gi,(_,k)=>{keys.push(k.toLowerCase()); return ""}).replace(/\[abrir:[a-z0-9]*$/i,"");
  el.innerHTML=mdLite(clean)+(final?actsHTML(keys):""); scrollLog();
}
const HARD=["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed","session_expired"];
async function ask(text){
  text=String(text||"").trim(); if(!text||H.busy) return;
  addMsg("me",esc(text)); H.turns.push({role:"user",content:text});
  const el=addMsg("bot",`<span class="think">Pensando…</span>`);
  if(H.mode==="local"||!H.sample){localAnswer(text,el); return}
  if(!online()){localAnswer(text,el,"Sem internet: esta resposta veio do guia guardado na ferramenta."); return}
  H.busy=true; setBusy(true); H.ctl=new AbortController();
  const hist=H.turns.slice(-10); while(hist.length&&hist[0].role!=="user") hist.shift();
  try{
    const r=await H.sample([{role:"user",content:rulesTurn()},...hist],{modelTier:"quick",cache:false,signal:H.ctl.signal,onText:({text:t})=>renderAI(t,el,false)});
    renderAI(r.text,el,true); H.turns.push({role:"assistant",content:r.text.replace(/\[abrir:[a-z0-9]+\]/gi,"").trim()});
    if(H.mode!=="ai"){H.mode="ai"; updMode()}
  }catch(e){
    const c=e&&e.code;
    if(c==="cancelled"){ if(e.text) renderAI(e.text,el,true); else el.innerHTML=`<span class="think">Pergunta cancelada.</span>`; H.turns.pop() }
    else if(HARD.includes(c)){H.mode="local"; updMode(); localAnswer(text,el)}
//#if app
    else localAnswer(text,el,c==="login"?"Esta resposta veio do guia. Para respostas da IA, entre na conta: toque em ⋯ e depois em Entrar na conta.":c==="quota"?`Você já usou as ${IA_LIMITE} perguntas de IA de hoje. Esta resposta veio do guia; amanhã a IA volta.`:c==="rate_limited"?"A IA está ocupada agora. Esta resposta veio do guia; tente de novo daqui a pouco.":c==="network"&&!online()?"Sem internet: esta resposta veio do guia guardado na ferramenta.":"Sem resposta da IA agora. Esta resposta veio do guia.");
//#else
    else localAnswer(text,el,c==="rate_limited"?"O Claude está ocupado agora. Esta resposta veio do guia; tente de novo daqui a pouco.":"Sem resposta do Claude agora. Esta resposta veio do guia.");
//#endif
  }finally{H.busy=false; H.ctl=null; setBusy(false)}
}
function setBusy(b){const s=$("#hSend"); s.innerHTML=b?`<svg class="i" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>`:`<svg class="i" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`; s.setAttribute("aria-label",b?"Parar":"Enviar"); s.type=b?"button":"submit"}
$("#bChat").onclick=()=>H.open?closeHelp():openHelp();
(window.requestIdleCallback||(f=>setTimeout(f,300)))(()=>{if(!hLog.children.length) helpWelcome()});
$("#hClose").onclick=closeHelp;
$("#hReset").onclick=()=>{if(H.ctl) H.ctl.abort(); H.turns=[]; hLog.innerHTML=""; helpWelcome()};
$("#hSend").addEventListener("click",e=>{if(H.busy){e.preventDefault(); if(H.ctl) H.ctl.abort()}});
$("#hForm").addEventListener("submit",e=>{e.preventDefault(); const v=hIn.value; hIn.value=""; hIn.style.height=""; ask(v)});
hIn.addEventListener("keydown",e=>{e.stopPropagation(); if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault(); $("#hForm").requestSubmit()} if(e.key==="Escape") closeHelp()});
hIn.addEventListener("input",()=>{hIn.style.height=""; hIn.style.height=Math.min(120,hIn.scrollHeight)+"px"});
hLog.addEventListener("click",e=>{
  const q=e.target.closest("[data-hq]"); if(q){const en=KB.find(x=>x.id===q.dataset.hq); if(en) ask(en.q); return}
  const g=e.target.closest("[data-hgo]"); if(g&&ACTS[g.dataset.hgo]){ const k=g.dataset.hgo; if(k!=="guia"&&(["inserir","exportar","projetos"].includes(k)||matchMedia("(max-width:700px)").matches)) closeHelp(); ACTS[g.dataset.hgo][1]() }
});

