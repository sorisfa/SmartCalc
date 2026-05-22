// Navigation & Section Switching
const navLinks = document.querySelectorAll('.nav-links li');
const calcSections = document.querySelectorAll('.calc-section');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // 활성화 상태 토글
    navLinks.forEach(n => n.classList.remove('active'));
    link.classList.add('active');

    // 타겟 섹션 보이기
    const targetId = link.getAttribute('data-target');
    calcSections.forEach(sec => {
      sec.classList.remove('active');
    });
    document.getElementById(targetId).classList.add('active');
  });
});

// History Manager
const historyManager = {
  addHistory(type, expression, result) {
    const historyList = document.getElementById('history-list');
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="expr">[${type}] ${expression}</div>
      <div class="result">${result}</div>
    `;
    historyList.prepend(item);
  },
  clearHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
  }
};

// Basic Calculator Logic
const basicCalc = {
  currentInput: '',
  previousInput: '',
  operator: null,
  displayEl: document.getElementById('basic-display'),
  historyEl: document.getElementById('basic-history-display'),

  updateDisplay() {
    this.displayEl.textContent = this.currentInput || '0';
    if (this.operator != null) {
      this.historyEl.textContent = `${this.previousInput} ${this.operator}`;
    } else {
      this.historyEl.textContent = '';
    }
  },

  appendNumber(number) {
    if (number === '.' && this.currentInput.includes('.')) return;
    this.currentInput = this.currentInput.toString() + number.toString();
    this.updateDisplay();
  },

  appendOperator(op) {
    if (this.currentInput === '') return;
    if (this.previousInput !== '') {
      this.calculate(false);
    }
    this.operator = op;
    this.previousInput = this.currentInput;
    this.currentInput = '';
    this.updateDisplay();
  },

  calculate(addToHistory = true) {
    let result;
    const prev = parseFloat(this.previousInput);
    const current = parseFloat(this.currentInput);
    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        result = prev / current;
        break;
      case '%':
        result = prev % current;
        break;
      default:
        return;
    }

    const expression = `${this.previousInput} ${this.operator} ${this.currentInput}`;
    
    // 부동소수점 오류 보정
    result = Math.round(result * 1000000000) / 1000000000;

    this.currentInput = result.toString();
    this.operator = null;
    this.previousInput = '';
    
    this.updateDisplay();
    this.historyEl.textContent = `${expression} =`;

    if (addToHistory) {
      historyManager.addHistory('기본', expression, result);
    }
  },

  clearAll() {
    this.currentInput = '';
    this.previousInput = '';
    this.operator = null;
    this.updateDisplay();
    this.historyEl.textContent = '';
  },

  deleteLast() {
    this.currentInput = this.currentInput.toString().slice(0, -1);
    this.updateDisplay();
  }
};

// Initialize
basicCalc.clearAll();

// Area Calculator Logic
const areaCalc = {
  sqmInput: document.getElementById('area-sqm'),
  pyeongInput: document.getElementById('area-pyeong'),
  
  setArea(sqm) {
    this.sqmInput.value = sqm;
    this.convertToPyeong();
  },
  
  convertToPyeong() {
    const sqm = parseFloat(this.sqmInput.value);
    if (isNaN(sqm)) {
      this.pyeongInput.value = '';
      return;
    }
    const pyeong = sqm * 0.3025;
    this.pyeongInput.value = pyeong.toFixed(2);
    historyManager.addHistory('평수', `${sqm}㎡`, `${pyeong.toFixed(2)}평`);
  },
  
  convertToSqm() {
    const pyeong = parseFloat(this.pyeongInput.value);
    if (isNaN(pyeong)) {
      this.sqmInput.value = '';
      return;
    }
    const sqm = pyeong / 0.3025;
    this.sqmInput.value = sqm.toFixed(2);
    historyManager.addHistory('평수', `${pyeong}평`, `${sqm.toFixed(2)}㎡`);
  },
  
  clear() {
    this.sqmInput.value = '';
    this.pyeongInput.value = '';
  }
};

// BMI Calculator Logic
const bmiCalc = {
  heightInput: document.getElementById('bmi-height'),
  weightInput: document.getElementById('bmi-weight'),
  resultBox: document.getElementById('bmi-result-box'),
  valueEl: document.getElementById('bmi-value'),
  statusEl: document.getElementById('bmi-status'),
  
  calculate() {
    const heightCm = parseFloat(this.heightInput.value);
    const weight = parseFloat(this.weightInput.value);
    
    if (isNaN(heightCm) || isNaN(weight) || heightCm <= 0 || weight <= 0) {
      alert("정확한 신장과 체중을 입력해주세요.");
      return;
    }
    
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    const bmiFixed = bmi.toFixed(1);
    
    let status = "";
    let color = "";
    if (bmi < 18.5) {
      status = "저체중"; color = "#3B82F6"; // Blue
    } else if (bmi < 23) {
      status = "정상"; color = "#10B981"; // Green
    } else if (bmi < 25) {
      status = "비만 전단계 (과체중)"; color = "#F59E0B"; // Yellow
    } else if (bmi < 30) {
      status = "1단계 비만"; color = "#EF4444"; // Red
    } else if (bmi < 35) {
      status = "2단계 비만"; color = "#DC2626"; // Dark Red
    } else {
      status = "3단계 비만"; color = "#991B1B"; // Darker Red
    }
    
    this.valueEl.textContent = bmiFixed;
    this.valueEl.style.color = color;
    this.statusEl.textContent = status;
    this.statusEl.style.color = color;
    
    this.resultBox.style.display = 'block';
    
    historyManager.addHistory('BMI', `${heightCm}cm / ${weight}kg`, `BMI: ${bmiFixed} (${status})`);
  }
};

// Date Calculator Logic
const dateCalc = {
  tabBtns: document.querySelectorAll('#calc-date .tab-btn'),
  tabs: document.querySelectorAll('#calc-date .tab-content'),
  
  // D-day
  baseInput: document.getElementById('date-base'),
  daysInput: document.getElementById('date-days'),
  ddayBox: document.getElementById('date-dday-result'),
  ddayValue: document.getElementById('date-dday-value'),
  
  // Diff
  startInput: document.getElementById('date-start'),
  endInput: document.getElementById('date-end'),
  diffBox: document.getElementById('date-diff-result'),
  diffValue: document.getElementById('date-diff-value'),
  
  init() {
    const today = new Date().toISOString().split('T')[0];
    this.baseInput.value = today;
    this.startInput.value = today;
    this.endInput.value = today;
  },
  
  switchTab(tabId) {
    this.tabBtns.forEach(btn => btn.classList.remove('active'));
    this.tabs.forEach(tab => tab.style.display = 'none');
    
    if (tabId === 'dday') {
      this.tabBtns[0].classList.add('active');
      document.getElementById('date-dday-tab').style.display = 'block';
    } else {
      this.tabBtns[1].classList.add('active');
      document.getElementById('date-diff-tab').style.display = 'block';
    }
  },
  
  calcDday() {
    if (!this.baseInput.value || !this.daysInput.value) return;
    
    const baseDate = new Date(this.baseInput.value);
    const days = parseInt(this.daysInput.value, 10);
    
    if (isNaN(days)) return;
    
    // JS에서 날짜 더하기
    baseDate.setDate(baseDate.getDate() + days);
    
    const y = baseDate.getFullYear();
    const m = String(baseDate.getMonth() + 1).padStart(2, '0');
    const d = String(baseDate.getDate()).padStart(2, '0');
    
    this.ddayValue.textContent = `${y}년 ${m}월 ${d}일`;
    this.ddayBox.style.display = 'block';
    
    historyManager.addHistory('D-day', `${this.baseInput.value} 기준 ${days > 0 ? '+'+days : days}일`, `${y}-${m}-${d}`);
  },
  
  calcDiff() {
    if (!this.startInput.value || !this.endInput.value) return;
    
    const start = new Date(this.startInput.value);
    const end = new Date(this.endInput.value);
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    this.diffValue.textContent = `${diffDays}일 차이`;
    this.diffBox.style.display = 'block';
    
    historyManager.addHistory('날짜', `${this.startInput.value} ~ ${this.endInput.value}`, `${diffDays}일 차이`);
  }
};

dateCalc.init();

// Exchange Rate Calculator Logic
const exchangeCalc = {
  amountInput: document.getElementById('exchange-amount'),
  fromSelect: document.getElementById('exchange-from'),
  toSelect: document.getElementById('exchange-to'),
  resultInput: document.getElementById('exchange-result'),
  infoDiv: document.getElementById('exchange-info'),
  rates: {},
  lastUpdate: '',
  
  setFrom(currency) {
    this.fromSelect.value = currency;
    this.calculate();
  },
  
  async fetchRates() {
    try {
      this.infoDiv.textContent = '환율 정보를 불러오는 중...';
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await res.json();
      this.rates = data.rates;
      this.lastUpdate = data.date;
      this.infoDiv.textContent = `기준일: ${this.lastUpdate} (USD 기준)`;
      this.calculate();
    } catch (e) {
      this.infoDiv.textContent = '환율 정보를 불러오는데 실패했습니다.';
    }
  },
  
  calculate() {
    const amount = parseFloat(this.amountInput.value);
    if (isNaN(amount) || Object.keys(this.rates).length === 0) {
      this.resultInput.value = '';
      return;
    }
    
    const from = this.fromSelect.value;
    const to = this.toSelect.value;
    
    // USD를 기준으로 변환
    const rateFrom = this.rates[from];
    const rateTo = this.rates[to];
    
    const usdAmount = amount / rateFrom;
    const result = usdAmount * rateTo;
    
    let fixedResult = result.toFixed(2);
    if (to === 'KRW' || to === 'JPY') fixedResult = Math.round(result).toLocaleString();
    else fixedResult = parseFloat(fixedResult).toLocaleString();
    
    this.resultInput.value = fixedResult;
    
    historyManager.addHistory('환율', `${amount.toLocaleString()}${from}`, `${fixedResult}${to}`);
  }
};

exchangeCalc.fetchRates();

// Loan Calculator Logic
const loanCalc = {
  amountInput: document.getElementById('loan-amount'),
  rateInput: document.getElementById('loan-rate'),
  monthsInput: document.getElementById('loan-months'),
  typeSelect: document.getElementById('loan-type'),
  resultBox: document.getElementById('loan-result-box'),
  paymentValue: document.getElementById('loan-monthly-payment'),
  totalInterestDiv: document.getElementById('loan-total-interest'),
  tableContainer: document.getElementById('loan-table-container'),
  tableBody: document.getElementById('loan-table-body'),
  
  calculate() {
    const P = parseFloat(this.amountInput.value);
    const rateYear = parseFloat(this.rateInput.value);
    const n = parseInt(this.monthsInput.value, 10);
    const type = this.typeSelect.value;
    
    if (isNaN(P) || isNaN(rateYear) || isNaN(n) || P <= 0 || rateYear <= 0 || n <= 0) {
      alert("정확한 값을 입력해주세요.");
      return;
    }
    
    const r = (rateYear / 100) / 12; // 월 이자율
    let firstPayment = 0;
    let totalInterest = 0;
    
    let scheduleHTML = '';
    let currentP = P;
    
    if (type === 'equal_pmt') {
      // 원리금균등
      const monthlyPayment = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      firstPayment = monthlyPayment;
      totalInterest = (monthlyPayment * n) - P;
      
      for(let i=1; i<=n; i++) {
        let interest = currentP * r;
        let principal = monthlyPayment - interest;
        currentP -= principal;
        if(currentP < 0) currentP = 0;
        
        scheduleHTML += `<tr>
          <td>${i}</td>
          <td>${Math.round(monthlyPayment).toLocaleString()}원</td>
          <td>${Math.round(principal).toLocaleString()}원</td>
          <td>${Math.round(interest).toLocaleString()}원</td>
          <td>${Math.round(currentP).toLocaleString()}원</td>
        </tr>`;
      }
    } else if (type === 'equal_prn') {
      // 원금균등
      const monthlyPrincipal = P / n;
      totalInterest = 0;
      
      for(let i=1; i<=n; i++) {
        let interest = currentP * r;
        let monthlyPayment = monthlyPrincipal + interest;
        if (i === 1) firstPayment = monthlyPayment;
        totalInterest += interest;
        currentP -= monthlyPrincipal;
        if(currentP < 0) currentP = 0;
        
        scheduleHTML += `<tr>
          <td>${i}</td>
          <td>${Math.round(monthlyPayment).toLocaleString()}원</td>
          <td>${Math.round(monthlyPrincipal).toLocaleString()}원</td>
          <td>${Math.round(interest).toLocaleString()}원</td>
          <td>${Math.round(currentP).toLocaleString()}원</td>
        </tr>`;
      }
    } else if (type === 'bullet') {
      // 만기일시
      firstPayment = P * r;
      totalInterest = P * r * n;
      
      for(let i=1; i<=n; i++) {
        let interest = P * r;
        let principal = (i === n) ? P : 0;
        let monthlyPayment = principal + interest;
        currentP -= principal;
        if(currentP < 0) currentP = 0;
        
        scheduleHTML += `<tr>
          <td>${i}</td>
          <td>${Math.round(monthlyPayment).toLocaleString()}원</td>
          <td>${Math.round(principal).toLocaleString()}원</td>
          <td>${Math.round(interest).toLocaleString()}원</td>
          <td>${Math.round(currentP).toLocaleString()}원</td>
        </tr>`;
      }
    }
    
    const formattedPayment = Math.round(firstPayment).toLocaleString() + "원";
    this.paymentValue.textContent = formattedPayment;
    this.totalInterestDiv.textContent = `총 이자: ${Math.round(totalInterest).toLocaleString()}원`;
    this.resultBox.style.display = 'block';
    
    this.tableBody.innerHTML = scheduleHTML;
    this.tableContainer.style.display = 'block';
    
    historyManager.addHistory('대출', `${P.toLocaleString()}원, ${rateYear}%`, `${formattedPayment}/월`);
  }
};

// Salary Calculator Logic
const salaryCalc = {
  amountInput: document.getElementById('salary-amount'),
  nontaxInput: document.getElementById('salary-nontax'),
  resultBox: document.getElementById('salary-result-box'),
  netValue: document.getElementById('salary-monthly-net'),
  pensionDiv: document.getElementById('salary-pension'),
  healthDiv: document.getElementById('salary-health'),
  empDiv: document.getElementById('salary-employment'),
  taxDiv: document.getElementById('salary-tax'),
  
  calculate() {
    const annualSalary = parseFloat(this.amountInput.value);
    const monthlyNontax = parseFloat(this.nontaxInput.value) || 0;
    
    if (isNaN(annualSalary) || annualSalary <= 0) {
      alert("정확한 연봉을 입력해주세요.");
      return;
    }
    
    const monthlyGross = Math.round(annualSalary / 12);
    const taxableIncome = Math.max(0, monthlyGross - monthlyNontax);
    
    // 단순화된 4대보험 요율 (2024년 기준 근사치)
    const pensionRate = 0.045; // 국민연금 4.5%
    const healthRate = 0.03545; // 건강보험 3.545%
    const longtermRate = 0.1295; // 장기요양 (건강보험료의 12.95%)
    const employmentRate = 0.009; // 고용보험 0.9%
    
    let pension = Math.min(taxableIncome, 5900000) * pensionRate;
    let health = taxableIncome * healthRate;
    let longterm = health * longtermRate;
    let employment = taxableIncome * employmentRate;
    
    // 소득세 (단순화된 근사치)
    let incomeTax = 0;
    if (taxableIncome > 2000000) {
      incomeTax = taxableIncome * 0.03;
    } else if (taxableIncome > 4000000) {
      incomeTax = taxableIncome * 0.05;
    } else if (taxableIncome > 6000000) {
      incomeTax = taxableIncome * 0.08;
    }
    const localTax = incomeTax * 0.1;
    
    const totalDeduct = pension + health + longterm + employment + incomeTax + localTax;
    const netSalary = monthlyGross - totalDeduct;
    
    const formattedNet = Math.round(netSalary).toLocaleString() + "원";
    this.netValue.textContent = formattedNet;
    this.pensionDiv.textContent = Math.round(pension).toLocaleString() + "원";
    this.healthDiv.textContent = Math.round(health + longterm).toLocaleString() + "원";
    this.empDiv.textContent = Math.round(employment).toLocaleString() + "원";
    this.taxDiv.textContent = Math.round(incomeTax + localTax).toLocaleString() + "원";
    
    this.resultBox.style.display = 'block';
    
    historyManager.addHistory('연봉', `${(annualSalary / 10000).toLocaleString()}만원`, `실수령 ${formattedNet}`);
  }
};
