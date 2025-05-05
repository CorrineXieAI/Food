function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });
  document.getElementById(pageId).style.display = '';
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const btns = document.querySelectorAll('.nav-btn');
  if (pageId === 'home') btns[0].classList.add('active');
  if (pageId === 'questionnaire') btns[1].classList.add('active');
  if (pageId === 'recommendation') btns[2].classList.add('active');
  if (pageId === 'profile') btns[3].classList.add('active');
  if (pageId === 'settings') btns[4].classList.add('active');
}

// 問卷提交
document.getElementById('quizForm').onsubmit = function(e) {
  e.preventDefault();
  const age = parseInt(document.getElementById('age').value, 10);
  const gender = document.getElementById('gender').value;
  const exercise = document.getElementById('exercise').checked;

  // 更豐富的推薦範例
  let recs = [];
  if (age > 60) {
    recs.push({
      title: "多攝取高鈣食物",
      desc: "如牛奶、優格、起司、深綠色蔬菜（菠菜、芥藍）、豆腐、芝麻、杏仁。"
    });
    recs.push({
      title: "適量補充維生素D",
      desc: "多曬太陽、食用鮭魚、鯖魚、蛋黃、香菇等。"
    });
  }
  if (gender === "女性") {
    recs.push({
      title: "補充大豆異黃酮",
      desc: "多吃黃豆、豆漿、豆腐等，有助於女性荷爾蒙平衡。"
    });
  }
  if (!exercise) {
    recs.push({
      title: "增加運動",
      desc: "每週至少三次負重運動（快走、慢跑、爬樓梯、跳舞），有助骨骼健康。"
    });
  }
  // 額外範例
  recs.push({
    title: "避免高鹽高磷食物",
    desc: "少吃加工食品、泡麵、含磷酸鹽飲料，避免鈣質流失。"
  });
  recs.push({
    title: "多喝水",
    desc: "保持身體水分，有助於新陳代謝與骨骼健康。"
  });
  recs.push({
    title: "均衡飲食",
    desc: "攝取多樣蔬果、全穀類、適量蛋白質，維持營養均衡。"
  });

  if (recs.length === 0) {
    recs.push({
      title: "維持健康生活",
      desc: "繼續保持良好習慣！"
    });
  }

  // 顯示推薦
  const recList = document.getElementById('recommendList');
  recList.innerHTML = '';
  recs.forEach(rec => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h2>${rec.title}</h2><p>${rec.desc}</p>`;
    recList.appendChild(div);
  });

  showPage('recommendation');
};

// 個人資料儲存
document.getElementById('profileForm').onsubmit = function(e) {
  e.preventDefault();
  alert('個人資料已儲存！');
};

// 預設顯示首頁
showPage('home');
