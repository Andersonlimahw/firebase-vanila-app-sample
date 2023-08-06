// Producers:
document
  .getElementById("firebase-google-login")
  .addEventListener("click", handleGoogleLogin);

// Consumers:
document.addEventListener("GOOGLE_LOGIN_EVENT_SUCCESS", (event) =>
  handleGoogleLoginSuccess(event)
);
document.addEventListener("GOOGLE_LOGIN_EVENT_ERROR", (event) =>
  handleGoogleLoginError(event)
);

// Functions:
function handleGoogleLoginSuccess(event) {
  const user = event.detail.data;
  const { email, displayName } = user;
  console.log(
    "[GoogleLogin][GOOGLE_LOGIN_EVENT_SUCCESS]handleGoogleLoginSuccess(): Event: ",
    event,
    " user: ",
    email,
    displayName
  );
}

function handleGoogleLoginError(event) {
  alert("Erro ao efetuar login com google, tente novamente mais tarde!");
  console.error(
    "[GoogleLogin][GOOGLE_LOGIN_EVENT_ERROR]handleGoogleLoginError(): Event: ",
    event
  );
}

function handleGoogleLogin() {
  try {
    // handleGooleLoginAsync();
    const loginEvent = new CustomEvent("GOOGLE_LOGIN_EVENT", {
      detail: {
        message: "GoogleLogin init",
        time: Date.now(),
      },
    });
    document.dispatchEvent(loginEvent);
  } catch (error) {
    console.error("[GoogleLogin][handleLoginGoogleLogin] : error => ", error);
    alert("Erro ao se entrar com google, tente novamente mais tarde1");
  }
}
