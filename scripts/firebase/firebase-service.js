import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// Add Firebase products that you want to use
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  onSnapshot,
  collectionGroup,
  where,
  getFirestore,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging.js";

import { renderInElement } from "../utils/render-in-element.js";

// TODO :  mudar config antes de comitar
const firebaseConfig = {
  apiKey: "<YOUR_VALUE>",
  authDomain: "<YOUR_VALUE>",
  databaseURL: "<YOUR_VALUE>",
  projectId: "<YOUR_VALUE>",
  storageBucket: "<YOUR_VALUE>",
  messagingSenderId: "<YOUR_VALUE>",
  appId: "<YOUR_VALUE>",
  measurementId: "<YOUR_VALUE>",
};

const PUBLIC_API_KEY_FCM =
  "<PUBLIC_API_KEY_FCM_VALUE>";

export class FirebaseService {
  constructor() {
    this.firebaseApp = initializeApp(firebaseConfig);
    this.messaging = getMessaging(this.firebaseApp);

    this.messagingGetToken = getToken;
    this.messagingIsSupported = isSupported;
    this.currentToken = window.firebaseNotificationToken;
    this.PUBLIC_API_KEY = PUBLIC_API_KEY_FCM;
    this.notificationStatus = {
      denied: () => alert("Por favor, ative as notificações!"),
      granted: () => {
        console.log("[FirebaseService]: Notificações habilitadas");
      },
    };
    this.db = getFirestore(this.firebaseApp);
    this.auth = getAuth(this.firebaseApp);
    this.started = true;
  }

  CustomNotify(
    message,
    title = "🍋 Hello!",
    image = "https://instagram.com/anderson.lima.dev"
  ) {
    alert(message);
    const notification = new Notification(title, {
      image: image,
      body: message,
    });
    return notification;
  }

  RequestNotificationPermission() {
    console.log("Requesting permission...");
    return Notification.requestPermission()
      .then((permission) => {
        console.log("Requesting permission... result", permission);
        // Handle status with literal objects
        this.notificationStatus[permission]();
        return true;
      })
      .catch((ex) => {
        throw new Error(`Notifications disabled: ${ex}`);
      });
  }

  RequestForToken = () => {
    const hasPermission = this.RequestNotificationPermission().then(
      (data) => data
    );
    if (!hasPermission) {
      return;
    }
    return getToken(this.messaging, { vapidKey: this.PUBLIC_API_KEY })
      .then(async (currentToken) => {
        if (currentToken) {
          // Send the token to your server and update the UI if necessary
          // ...
          // Configurar o serviço de ouvinte de mensagens Firebase Cloud Messaging

          window.firebaseNotificationToken = currentToken;
          this.currentToken = currentToken;
          console.log(
            "👨‍💻 [FirebaseService] : Notifications : currentToken",
            currentToken
          );
          return currentToken;
        } else {
          // Show permission request UI
          console.log(
            "👨‍💻 [FirebaseService] Notifications : No registration token available. Request permission to generate one."
          );
        }
      })
      .catch((err) => {
        console.error(
          "🐞 [FirebaseService] An error occurred while retrieving token. ",
          err
        );
      });
  };

  RenderNotification = (payload) => {
    if (payload) {
      const { title, body, image } = payload;
      this.CustomNotify(body, title, image);
    }
  };

  onMessageListener = () =>
    new Promise((resolve) => {
      onMessage(this.messaging, (payload) => {
        console.log(
          "[Notifications]: payload",
          payload,
          " messaging: ",
          messaging
        );
        RenderNotification(payload);
        resolve(payload);
      });
    });

  // CRUD:
  CreateItemOnCollection = async (collectionName, payload) => {
    try {
      console.log("[Firebase][Add] - Init - payload: ", payload);
      const response = await addDoc(collection(this.db, collectionName), {
        ...payload,
        created: Timestamp.now(),
      });
      console.log(
        "[Firebase][Add] - Success - response: ",
        response,
        "id: ",
        response.id,
        " payload: ",
        payload
      );
      return {
        id: response.id,
      };
    } catch (ex) {
      console.error("[Firebase][Add] - Error: ", ex);
      throw new Error(`Error to create document: ${ex}`);
    }
  };

  ListCollection = async (collectionName) => {
    try {
      const response = await query(
        collection(this.db, collectionName),
        orderBy("created", "asc")
      );
      console.log(
        "[Firebase][get] - Success - url: ",
        collectionName,
        " response: ",
        response
      );
      return response;
    } catch (ex) {
      console.error("[Firebase][get] - Error: ", ex);
      throw new Error(`Error to get document: ${ex}`);
    }
  };

  GetCollectionWithWhereFilter = async (collectionName, filter) => {
    try {
      const response = await query(
        collection(this.db, collectionName),
        where(`${filter.key}`, "==", filter.value),
        orderBy("created", "asc")
      );
      console.log(
        "[Firebase][get] - Success - url: ",
        collectionName,
        " response: ",
        response
      );
      renderInElement("firebase-sample", response);
      return response;
    } catch (ex) {
      console.error("[Firebase][get] - Error: ", ex);
      throw new Error(`Error to get document: ${ex}`);
    }
  };

  GetCollectionWithInFilter = async (collectionName, filter) => {
    try {
      const operator = "in";
      const response = await query(
        collection(this.db, collectionName),
        where(`${filter.key}`, operator, [...filter.value]),
        orderBy("created", "asc")
      );
      console.log(
        "[Firebase][get] - Success - url: ",
        collectionName,
        " response: ",
        response
      );
      return response;
    } catch (ex) {
      console.error("[Firebase][get] - Error: ", ex);
      throw new Error(`Error to get document: ${ex}`);
    }
  };

  GetCollectionItemById = async (collectionName, id) => {
    try {
      if (!id) {
        throw new Error(`Error to getById id: ${id}`);
      }
      const documentRefById = await doc(this.db, collectionName, id);
      const response = await getDoc(documentRefById);
      console.log(
        "[Firebase][getById] - Success - response: ",
        response,
        " collectionName: ",
        collectionName
      );
      return {
        ...response,
        id: response.id,
        data: response.data(),
      };
    } catch (ex) {
      console.error(
        "[Firebase][getById] - Error: ",
        ex,
        "Input: ",
        collectionName,
        id
      );
      throw new Error(`Error to getById document: ${ex}`);
    }
  };

  UpdateItemById = async (collectionName, id, payload) => {
    try {
      const documentRefById = await doc(this.db, collectionName, id);
      const response = await updateDoc(documentRefById, {
        ...payload,
        updatedAt: Timestamp.now(),
      });
      console.log(
        "[Firebase][update] - Success - response: ",
        response,
        " payload: ",
        payload
      );
      return {
        id: id,
        success: true,
        date: Timestamp.now(),
      };
    } catch (ex) {
      console.error("[Firebase][update] - Error: ", ex);
      throw new Error(`Error to update document: ${ex}`);
    }
  };

  DeleteItemById = async (collectionName, id) => {
    try {
      const documentRefById = await doc(this.db, collectionName, id);
      const response = await deleteDoc(documentRefById);

      console.log("[Firebase][deleteById] - Success - response: ", response);
      return {
        id: id,
        success: true,
        date: Timestamp.now(),
      };
    } catch (ex) {
      console.error("[Firebase][deleteById] - Error: ", ex);
      throw new Error(`Error to deleteById document: ${ex}`);
    }
  };

  // Login
  HandleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Login com o Google bem-sucedido
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao executar login.");
      // Tratar erros de login com o Google
    }
  };
}

export function initService() {
  const firebaseInstance = new FirebaseService();
  window.FirebaseService = firebaseInstance;
  console.log(
    "👌 [FirebaseService] : Init : service started with success",
    window.FirebaseService
  );
  return firebaseInstance;
}

// Custom Events
document.addEventListener("DOMContentLoaded", function () {
  initService();
  const event = new CustomEvent("onCustomFirebaseLoaded", {
    detail: {
      firebaseLoaded: true,
    },
  });

  document.querySelector("body").dispatchEvent(event);
});

window.addEventListener("onGoogleLoginEvent", function (event) {
  console.error("[Event]: [GOOGLE_LOGIN_EVENT] : event", event);
  try {
    window.FirebaseService.HandleGoogleLogin();
  } catch (error) {
    console.error(
      "[Event]: [GOOGLE_LOGIN_EVENT] : Erro ao efetuar login",
      error
    );
  }
});

window.addEventListener("onGoogleLogoutEvent", function (event) {
  console.error(
    "[Event]: [GOOGLE_LOGOUT_EVENT] : Erro ao efetuar login",
    event
  );
  try {
    window.FirebaseService.HandleGoogleLogin();
  } catch (error) {
    console.error(
      "[Event]: [GOOGLE_LOGOUT_EVENT] : Erro ao efetuar logout",
      error
    );
  }
});
