export const renderInElement = (elementId, value) => {
    try {
        if (elementId && value) {
            let element = document.getElementById(elementId);
            if(element) {
                element.innerHTML = value 
                console.log(`[renderInElement]: Elemento renderizado com sucesso: elementId: ${elementId}`);
            } else {
                console.log(`[renderInElement]: Elemento não encontrado com sucesso: elementId: ${elementId}`);
            }
            
        }
    } catch (ex) {
        console.error(`[renderInElement]: Erro ao rendenrizar elemento de id ${elementId}`);
        throw ex;
    }
}