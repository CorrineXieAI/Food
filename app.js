// 問卷流程分頁切換與資料收集

document.addEventListener('DOMContentLoaded', function() {
  // 頁面元素
  const pages = {
    welcome: document.getElementById('welcome'),
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    result: document.getElementById('result'),
    foodRecommend: document.getElementById('foodRecommend')
  };
  const startBtn = document.getElementById('startBtn');
  const formStep1 = document.getElementById('formStep1');
  const formStep2 = document.getElementById('formStep2');
  const restartBtn = document.getElementById('restartBtn');
  const scoreValue = document.getElementById('scoreValue');
  const riskLevel = document.getElementById('riskLevel');
  const adviceList = document.getElementById('adviceList');
  const adviceListFood = document.getElementById('adviceListFood');
  const adviceListSport = document.getElementById('adviceListSport');
  const bmiBox = document.getElementById('bmiBox');
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const menopauseBox = document.getElementById('menopauseBox');
  const menopauseSelect = document.getElementById('menopause');
  const genderInput = document.getElementById('gender');
  const goFoodRecommendBtn = document.getElementById('goFoodRecommendBtn');
  const foodRecommendSection = document.getElementById('foodRecommend');
  const foodRecommendList = document.getElementById('foodRecommendList');
  const backToResultBtn = document.getElementById('backToResultBtn');

  let formData = {};
  let lastRiskLevel = 'low';

  // 分頁切換函數
  function showPage(pageKey) {
    Object.values(pages).forEach(page => page.style.display = 'none');
    pages[pageKey].style.display = 'block';
  }

  // 即時計算BMI
  function updateBMI() {
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);
    if (h && w) {
      const bmi = w / Math.pow(h/100, 2);
      let status = '';
      if (bmi < 18.5) status = '體重過輕';
      else if (bmi < 24) status = '體重正常';
      else if (bmi < 27) status = '體重過重';
      else status = '肥胖';
      bmiBox.innerHTML = `<b>您的BMI指數：</b> ${bmi.toFixed(1)}<br>體重狀態：<b>${status}</b>`;
      bmiBox.style.display = '';
    } else {
      bmiBox.style.display = 'none';
    }
  }
  heightInput.addEventListener('input', updateBMI);
  weightInput.addEventListener('input', updateBMI);

  // 開始評估
  startBtn.addEventListener('click', function() {
    showPage('step1');
  });

  // Step1 提交
  formStep1.addEventListener('submit', function(e) {
    e.preventDefault();
    // 檢查BMI
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);
    if (!(h && w)) {
      bmiBox.innerHTML = '<span style="color:#ef4444">請輸入身高與體重</span>';
      bmiBox.style.display = '';
      return;
    }
    // 收集 step1 資料
    formData = {
      nickname: formStep1.nickname.value,
      gender: formStep1.gender.value,
      age: formStep1.age.value,
      height: h,
      weight: w
    };
    showPage('step2');
  });

  // 動態顯示停經問題
  genderInput.addEventListener('change', function() {
    if (genderInput.value === '女性') {
      menopauseBox.style.display = '';
    } else {
      menopauseBox.style.display = 'none';
      menopauseSelect.value = '';
    }
  });

  // Step2 提交
  formStep2.addEventListener('submit', function(e) {
    e.preventDefault();
    // 欄位驗證
    let valid = true;
    let firstInvalid = null;
    const requiredFields = [
      'foodProcessed','foodMicrowave','foodUnhealthy','foodSugaryDrink',
      'clothSynthetic','clothCoating','clothPlastic',
      'livePollution','liveChemicals','livePlastic',
      'transType','transPollution','transLong'
    ];
    requiredFields.forEach(id => {
      const el = formStep2[id];
      if (!el.value) {
        el.style.borderColor = '#ef4444';
        if (!firstInvalid) firstInvalid = el;
        valid = false;
      } else {
        el.style.borderColor = '';
      }
    });
    // 女性要檢查停經
    if (menopauseBox.style.display !== 'none' && !menopauseSelect.value) {
      menopauseSelect.style.borderColor = '#ef4444';
      if (!firstInvalid) firstInvalid = menopauseSelect;
      valid = false;
    } else {
      menopauseSelect.style.borderColor = '';
    }
    if (!valid) {
      alert('請完整填寫所有欄位！');
      if (firstInvalid) firstInvalid.scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
    // 收集 step2 資料
    formData = {
      ...formData,
      foodProcessed: formStep2.foodProcessed.value,
      foodMicrowave: formStep2.foodMicrowave.value,
      foodUnhealthy: formStep2.foodUnhealthy.value,
      foodSugaryDrink: formStep2.foodSugaryDrink.value,
      menopause: menopauseBox.style.display !== 'none' ? menopauseSelect.value : '',
      clothSynthetic: formStep2.clothSynthetic.value,
      clothCoating: formStep2.clothCoating.value,
      clothPlastic: formStep2.clothPlastic.value,
      livePollution: formStep2.livePollution.value,
      liveChemicals: formStep2.liveChemicals.value,
      livePlastic: formStep2.livePlastic.value,
      transType: formStep2.transType.value,
      transPollution: formStep2.transPollution.value,
      transLong: formStep2.transLong.value
    };
    // Debug
    //console.log(formData);
    // 計算分數與風險
    const {score, level} = calcRisk(formData);
    // 顯示結果
    showResult(score, level);
    showPage('result');
  });

  // 重新評估
  restartBtn.addEventListener('click', function() {
    formStep1.reset();
    formStep2.reset();
    showPage('welcome');
  });

  // 風險計算（新版，根據新欄位）
  function calcRisk(data) {
    let score = 100;
    // 年齡加權
    if (data.age >= 65) score -= 20;
    else if (data.age >= 50) score -= 10;
    // 體重過輕
    const bmi = data.weight / Math.pow(data.height/100, 2);
    if (bmi < 18.5) score -= 15;
    // 女性停經
    if (data.gender === '女性' && data.menopause === '是') score -= 10;
    // 食
    if (data.foodProcessed === '經常') score -= 8;
    if (data.foodMicrowave === '經常') score -= 6;
    if (data.foodUnhealthy === '經常') score -= 8;
    if (data.foodSugaryDrink === '經常') score -= 4;
    // 衣
    if (data.clothSynthetic === '經常') score -= 2;
    if (data.clothCoating === '經常') score -= 2;
    if (data.clothPlastic === '經常') score -= 2;
    // 住
    if (data.livePollution === '是') score -= 8;
    if (data.liveChemicals === '經常') score -= 6;
    if (data.livePlastic === '經常') score -= 4;
    // 行
    if (data.transType === '汽機車') score -= 4;
    if (data.transPollution === '經常') score -= 4;
    if (data.transLong === '是') score -= 2;
    // 最低分數限制
    if (score < 40) score = 40;
    // 風險等級
    let level = 'low';
    if (score < 70 && score >= 55) level = 'medium';
    else if (score < 55) level = 'high';
    return {score, level};
  }

  // 顯示結果與建議
  function showResult(score, level) {
    scoreValue.textContent = score;
    riskLevel.textContent = level === 'low' ? '低風險' : level === 'medium' ? '中風險' : '高風險';
    riskLevel.className = level;
    lastRiskLevel = level;
    // 飲食建議（可展開詳細食物套組）
    const foodAdvices = {
      low: [
        {
          title: '✅ 多攝取高鈣食物',
          groups: [
            { title: '地中海飲食', list: ['橄欖油', '全穀類', '豆類', '深綠色蔬菜', '魚類', '堅果'] },
            { title: '高鈣食物', list: ['牛奶', '豆腐', '小魚乾', '起司', '芝麻', '深綠色蔬菜'] }
          ]
        },
        {
          title: '✅ 均衡飲食，避免過多鹽分',
          groups: [
            { title: '少鹽飲食', list: ['少鹽烹調', '多蔬果', '避免醃製食品', '多喝水'] }
          ]
        },
        {
          title: '✅ 適量補充維生素D',
          groups: [
            { title: '維生素D來源', list: ['曬太陽', '鮭魚', '蛋黃', '香菇', '維生素D補充劑'] }
          ]
        }
      ],
      medium: [
        {
          title: '⚠️ 增加鈣質與維生素D攝取',
          groups: [
            { title: '高鈣食物', list: ['牛奶', '優格', '豆腐', '小魚乾', '深綠色蔬菜'] },
            { title: '維生素D來源', list: ['曬太陽', '鮭魚', '蛋黃', '香菇', '維生素D補充劑'] }
          ]
        },
        {
          title: '⚠️ 減少油炸、加工食品',
          groups: [
            { title: '健康飲食建議', list: ['避免炸雞、薯條', '少吃香腸、火腿、罐頭', '多選新鮮食材'] }
          ]
        },
        {
          title: '⚠️ 避免含糖飲料與高鹽食物',
          groups: [
            { title: '健康飲水', list: ['多喝白開水', '少喝手搖飲', '避免醃製品'] }
          ]
        }
      ],
      high: [
        {
          title: '❗ 儘速諮詢營養師調整飲食',
          groups: [
            { title: '專業飲食調整', list: ['依專業建議調整飲食', '定期追蹤營養狀態'] }
          ]
        },
        {
          title: '❗ 嚴格避免高鹽、高糖、高油飲食',
          groups: [
            { title: '健康飲食原則', list: ['避免速食、零食', '多吃原型食物', '多蔬果'] }
          ]
        },
        {
          title: '❗ 依醫囑補充鈣質與維生素D',
          groups: [
            { title: '補充建議', list: ['遵照醫囑補充', '定期檢查血鈣、維生素D'] }
          ]
        }
      ]
    };
    const sportAdvices = {
      low: [
        '✅ 每週進行3次以上快走、慢跑或游泳',
        '✅ 適度負重運動（如彈力帶、啞鈴）',
        '✅ 維持日常活動量'
      ],
      medium: [
        '⚠️ 增加步行、爬樓梯等日常活動',
        '⚠️ 每週2-3次簡單負重運動',
        '⚠️ 避免久坐，定時伸展'
      ],
      high: [
        '❗ 先諮詢醫師再進行運動',
        '❗ 避免劇烈或高衝擊運動',
        '❗ 可考慮物理治療師指導下的安全運動'
      ]
    };
    // 清空並渲染飲食建議（可展開）
    adviceListFood.innerHTML = '';
    foodAdvices[level].forEach((advice, idx) => {
      const card = document.createElement('div');
      card.className = `advice-card ${level} expandable`;
      card.tabIndex = 0;
      card.innerHTML = `<div class="advice-title">${advice.title}</div><div class="advice-details" style="display:none;"></div>`;
      const detailsDiv = card.querySelector('.advice-details');
      detailsDiv.innerHTML = advice.groups.map(group =>
        `<div class='food-group'><div class='food-group-title'>${group.title}</div><div class='food-group-list'>${group.list.map(item => `<div>• ${item}</div>`).join('')}</div></div>`
      ).join('');
      card.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = detailsDiv.style.display === '';
        adviceListFood.querySelectorAll('.advice-details').forEach(d => d.style.display = 'none');
        if (!isOpen) detailsDiv.style.display = '';
      });
      adviceListFood.appendChild(card);
    });
    // 清空並渲染運動建議
    adviceListSport.innerHTML = '';
    sportAdvices[level].forEach(advice => {
      const div = document.createElement('div');
      div.className = `advice-card ${level}`;
      div.textContent = advice;
      adviceListSport.appendChild(div);
    });
  }

  // 飲食推薦頁切換
  goFoodRecommendBtn.addEventListener('click', function() {
    showPage('foodRecommend');
    renderFoodRecommend(lastRiskLevel);
  });
  backToResultBtn.addEventListener('click', function() {
    showPage('result');
  });

  function renderFoodRecommend(level) {
    // 細緻化骨質疏鬆飲食推薦套餐
    const foodPackages = [
      {
        title: '地中海飲食套餐',
        desc: '強調多蔬果、全穀、橄欖油、魚類與堅果，有助於骨骼健康與抗發炎。',
        foods: [
          '全麥麵包、糙米、燕麥',
          '鮭魚、沙丁魚、雞胸肉、豆腐',
          '菠菜、羽衣甘藍、番茄、花椰菜',
          '橄欖油、堅果（杏仁、核桃）',
          '優格、起司',
          '橙、奇異果、葡萄'
        ]
      },
      {
        title: '高鈣套餐',
        desc: '高鈣飲食有助於維持骨密度，預防骨質疏鬆。',
        foods: [
          '牛奶、優格、起司',
          '豆腐、豆漿',
          '小魚乾、吻仔魚',
          '芝麻、杏仁',
          '深綠色蔬菜（菠菜、芥藍、莧菜）'
        ]
      },
      {
        title: '維生素D補充套餐',
        desc: '維生素D有助於鈣質吸收，促進骨骼健康。',
        foods: [
          '鮭魚、鯖魚、沙丁魚',
          '蛋黃',
          '香菇（曬過太陽）',
          '強化維生素D的牛奶或豆漿',
          '曬太陽（每天10-20分鐘）'
        ]
      },
      {
        title: '抗發炎套餐',
        desc: '抗發炎飲食有助於減少骨質流失。',
        foods: [
          '深海魚（鮭魚、鯖魚）',
          '橄欖油',
          '堅果',
          '藍莓、奇異果',
          '綠茶'
        ]
      },
      {
        title: '少鹽少糖套餐',
        desc: '過多鹽分和糖分會加速鈣質流失，應避免。',
        foods: [
          '新鮮蔬果',
          '原型食物',
          '少加工、少調味'
        ]
      }
    ];
    // 風險等級可調整顯示套餐數量
    let showPackages = foodPackages;
    if (level === 'low') showPackages = foodPackages.slice(0, 3);
    else if (level === 'medium') showPackages = foodPackages.slice(0, 4);
    // 高風險顯示全部
    foodRecommendList.innerHTML = '';
    showPackages.forEach(pkg => {
      const card = document.createElement('div');
      card.className = 'food-recommend-card';
      card.innerHTML = `<div class='food-recommend-title'>${pkg.title}</div>` +
        `<div style='margin:0.5rem 0 0.7rem 0; color:#475569;'>${pkg.desc}</div>` +
        `<div class='food-group-list'>${pkg.foods.map(item => `<div>• ${item}</div>`).join('')}</div>`;
      foodRecommendList.appendChild(card);
    });
  }

  // 預設顯示首頁
  showPage('welcome');
});

// 添加頁面載入動畫
window.addEventListener('load', function() {
  document.body.classList.add('loaded');
}); 
