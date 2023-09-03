import { renderInElement } from "../utils/render-in-element.js";
import { initService } from './firebase-service.js';

const chatId = "#firebase-sample";

export class FirebaseChatService {
  constructor(firebaseService) {
    this._firebaseService = firebaseService;
    this.collectionName = "chat";
  }

  Log() {
    console.log(
      "[FirebaseChatService]:[ListChat] LOG()",
      this,
      " Instance: ",
      this._firebaseService,
      "CollectionName: ",
      this.collectionName
    );
  }

  // Retorna Snapshot para atualizar as mensagens em tempo real
  async ListChat(chatId) {
    try {
      const filter = {
        key: "chat_id",
        value: chatId,
      };
      await this._firebaseService.GetCollectionWithWhereFilter(
        this.collectionName,
        filter
      );
    } catch (error) {
      console.log(
        "[FirebaseChatService]:[ListChat] - Erro ao listar chat ",
        error
      );
      throw new Error("[FirebaseChatService]:[ListChat] - Erro ao listar chat");
    }
  }

  // Criar um novo chat entre cliente e cliente
  async NewChat(chat_id, from, subject, to) {
    try {
      const payload = {
        chat_id: chat_id,
        from: from,
        subject: subject,
        to: to,
        time: Date.now(),
      };

      await this._firebaseService
        .CreateItemOnCollection(this.collectionName, payload)
        .then((data) => data)
        .catch((ex) => new Error(ex));
    } catch (error) {
      console.log(
        "[FirebaseChatService]:[NewChat] - Erro ao criar chat ",
        error
      );
      throw new Error("[FirebaseChatService]:[NewChat] - Erro ao criar chat");
    }
  }

  // Envia uma mensagem entre o cliente e o prestador
  async SendMessage(chat_id, from, to, content) {
    try {
      const MESSAGES_COLLECTION_NAME = "msg";
      const payload = {
        chat_id: chat_id,
        from: from,
        content: content,
        to: to,
        time: Date.now(),
      };
      const response = await this._firebaseService
        .CreateItemOnCollection(MESSAGES_COLLECTION_NAME, payload)
        .then((data) => data);
      return {
        docRef: response,
      };
    } catch (error) {
      console.log(
        "[FirebaseChatService]:[NewChat] - Erro ao criar chat ",
        error
      );
      throw new Error("[FirebaseChatService]:[NewChat] - Erro ao listar chat");
    }
  }
}

function init() {
  const firebaseService = initService();
  const firebaseInstance = new FirebaseChatService(firebaseService);

  console.log(
    "👌 [FirebaseChatService] : Init : serviço iniciado com sucesso",
    firebaseInstance
  );
  document
    .querySelector("body")
    .addEventListener("onCustomFirebaseLoaded", (event) => {
      console.log(
        "[Events] onFirebaseLoaded : event => ",
        event,
        " : firebaseInstance => ",
        firebaseInstance
      );
    });
  dispatchCustomEvents();
  return firebaseInstance;
}



document.addEventListener("DOMContentLoaded", function () {
  renderInElement('firebase-sample', '<h1>loading...</h1>')
  setTimeout(function () {
    init();
  }, 3000);
});

function dispatchCustomEvents() {
  const event = new CustomEvent("onCustomFirebasechatLoaded", {
    detail: {
      firebaseChatLoaded: true,
    },
  });  
  document.querySelector(chatId).dispatchEvent(event);
}

document.querySelector(chatId).addEventListener("onCustomFirebasechatLoaded", (event) => {
  console.log(
    "👌 [FirebaseChatService][onCustomFirebasechatLoaded] : Init : serviço iniciado com sucesso, event: ",
    event
  );
  const content = `
  <h2>
    Nice, chat service is avaliable!
  </h2>`;
  renderInElement('firebase-sample', content)
});