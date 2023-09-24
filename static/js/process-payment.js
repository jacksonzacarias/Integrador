var maskCPF = IMask(document.getElementById('paymentForm__identificationNumber'), {
  mask: '000.000.000-00'
})
console.log("ta aqui esse safado", maskCPF)
// Cria uma instância do MercadoPago com a chave de teste fornecida
const mp = new MercadoPago("TEST-7ede54d7-5958-4add-9cca-00c2ce34c2d4");

// Cria elementos para entrada de dados do número do cartão, data de expiração e código de segurança
const cardNumberElement = mp.fields.create('cardNumber', {
  placeholder: "Número do cartão"
}).mount('paymentForm__cardNumber');
const expirationDateElement = mp.fields.create('expirationDate', {
  placeholder: "MM/YY",
}).mount('paymentForm__expirationDate');
const securityCodeElement = mp.fields.create('securityCode', {
  placeholder: "Código de segurança"
}).mount('paymentForm__securityCode');

// Função assíncrona para obter os tipos de identificação disponíveis
(async function getIdentificationTypes() {
  try {
    const identificationTypes = await mp.getIdentificationTypes();
    const identificationTypeElement = document.getElementById('paymentForm__identificationType');

    // Cria opções para o elemento de seleção de tipo de identificação
    createSelectOptions(identificationTypeElement, identificationTypes);
  } catch (e) {
    return console.error('Erro ao obter tipos de identificação: ', e);
  }
})();

// Função para criar opções para um elemento de seleção
function createSelectOptions(elem, options, labelsAndKeys = { label: "name", value: "id" }) {
  const { label, value } = labelsAndKeys;

  elem.options.length = 0;

  const tempOptions = document.createDocumentFragment();

  options.forEach(option => {
    const optValue = option[value];
    const optLabel = option[label];

    const opt = document.createElement('option');
    opt.value = optValue;
    opt.textContent = optLabel;

    tempOptions.appendChild(opt);
  });

  elem.appendChild(tempOptions);
}

// Obtém elementos do DOM para elementos relacionados ao método de pagamento, banco emissor e parcelas
const paymentMethodElement = document.getElementById('paymentMethodId');
const issuerElement = document.getElementById('paymentForm__issuer');
const installmentsElement = document.getElementById('paymentForm__installments');

const issuerPlaceholder = "Banco emissor";
const installmentsPlaceholder = "Parcelas";

// Variável para rastrear o BIN (Bank Identification Number) atual do cartão
let currentBin;

// Manipulador de evento para quando o BIN do cartão muda
cardNumberElement.on('binChange', async (data) => {
  const { bin } = data;
  try {
    if (!bin && paymentMethodElement.value) {
      // Limpa seleções e define espaços reservados quando não há BIN
      clearSelectsAndSetPlaceholders();
      paymentMethodElement.value = "";
    }

    if (bin && bin !== currentBin) {
      // Obtém os métodos de pagamento com base no BIN
      const { results } = await mp.getPaymentMethods({ bin });
      const paymentMethod = results[0];

      // Define o método de pagamento selecionado e atualiza as configurações dos campos PCI
      paymentMethodElement.value = paymentMethod.id;
      updatePCIFieldsSettings(paymentMethod);
      updateIssuer(paymentMethod, bin);
      updateInstallments(paymentMethod, bin);
    }

    currentBin = bin;
  } catch (e) {
    console.error('Erro ao obter métodos de pagamento: ', e);
  }
});

// Função para limpar seleções e definir espaços reservados
function clearSelectsAndSetPlaceholders() {
  clearHTMLSelectChildrenFrom(issuerElement);
  createSelectElementPlaceholder(issuerElement, issuerPlaceholder);

  clearHTMLSelectChildrenFrom(installmentsElement);
  createSelectElementPlaceholder(installmentsElement, installmentsPlaceholder);
}

// Função para limpar elementos filho de um elemento de seleção HTML
function clearHTMLSelectChildrenFrom(element) {
  const currOptions = [...element.children];
  currOptions.forEach(child => child.remove());
}

// Função para criar um espaço reservado para um elemento de seleção
function createSelectElementPlaceholder(element, placeholder) {
  const optionElement = document.createElement('option');
  optionElement.textContent = placeholder;
  optionElement.setAttribute('selected', "");
  optionElement.setAttribute('disabled', "");

  element.appendChild(optionElement);
}

// Esta etapa melhora as validações cardNumber e securityCode

// Função para atualizar as configurações dos campos PCI
function updatePCIFieldsSettings(paymentMethod) {
  const { settings } = paymentMethod;

  const cardNumberSettings = settings[0].card_number;
  cardNumberElement.update({
    settings: cardNumberSettings
  });

  const securityCodeSettings = settings[0].security_code;
  securityCodeElement.update({
    settings: securityCodeSettings
  });
}

// Função assíncrona para atualizar o banco emissor com base no método de pagamento e no BIN
async function updateIssuer(paymentMethod, bin) {
  const { additional_info_needed, issuer } = paymentMethod;
  let issuerOptions = [issuer];

  if (additional_info_needed.includes('issuer_id')) {
    issuerOptions = await getIssuers(paymentMethod, bin);
  }

  // Cria opções para o elemento de seleção de banco emissor
  createSelectOptions(issuerElement, issuerOptions);
}

// Função assíncrona para obter os emissores de banco com base no método de pagamento e no BIN
async function getIssuers(paymentMethod, bin) {
  try {
    const { id: paymentMethodId } = paymentMethod;
    return await mp.getIssuers({ paymentMethodId, bin });
  } catch (e) {
    console.error('Erro ao obter emissores de banco: ', e);
  }
};

// Função assíncrona para atualizar as opções de parcelas com base no método de pagamento e no BIN
async function updateInstallments(paymentMethod, bin) {
  try {
    const installments = await mp.getInstallments({
      amount: document.getElementById('transactionAmount').value,
      bin,
      paymentTypeId: 'credit_card'
    });
    const installmentOptions = installments[0].payer_costs;
    const installmentOptionsKeys = { label: 'recommended_message', value: 'installments' };
    createSelectOptions(installmentsElement, installmentOptions, installmentOptionsKeys);
  } catch (error) {
    console.error('Erro ao obter opções de parcelas: ', e);
  }
}

// Obtém o elemento do formulário e adiciona um ouvinte de evento para criar um token de cartão
const formElement = document.getElementById('paymentForm');
formElement.addEventListener('submit', createCardToken);

// Função assíncrona para criar um token de cartão
async function createCardToken(event) {
  try {
    const tokenElement = document.getElementById('token');
    if (!tokenElement.value) {
      event.preventDefault();
      const token = await mp.fields.createCardToken({
        cardholderName: document.getElementById('paymentForm__cardholderName').value,
        identificationType: document.getElementById('paymentForm__identificationType').value,
        identificationNumber: document.getElementById('paymentForm__identificationNumber').value = maskCPF.unmaskedValue,
      });
      console.log("a coisa ta dificil aqui em",document.getElementById('paymentForm__identificationNumber'));
      console.log("a coisa ta dificil aqui em",document.getElementById('paymentForm__expirationMonth'));
      console.log("a coisa ta dificil aqui em",document.getElementById('paymentForm__expirationYear'));
      console.log("a coisa ta dificil aqui em",document.getElementById('paymentForm__cardholderName'));
      console.log("a coisa ta dificil aqui em",document.getElementById('paymentForm__securityCode'));
      console.log("a coisa ta dificil aqui em",document.getElementById('paymentForm__cardNumber'));
      console.log("a coisa ta dificil aqui em",document.getElementById('paymentForm__issuer'));
      
      tokenElement.value = token.id;
      formElement.requestSubmit();
    }
  } catch (e) {
    console.error('Erro ao criar token de cartão: ', e);
    console.log("se tu me ver é por que deu merda", e)
  }
}
