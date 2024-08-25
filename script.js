let currentOrder = [];
let salesHistory = {};
let adminTouchCount = 0;
const adminPassword = "2408";

// 날짜 생성 함수
function generateDates(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

// 페이지 초기화: 관리자 페이지를 숨기고 판매 페이지만 보이도록 설정
document.getElementById('adminPage').style.display = 'none';

// 실제 상품 데이터
const products = {
    drinks: [
        { id: 1, name: '몬스터', price: 3000, img: 'monster.jpg' },
        { id: 2, name: '좀비', price: 3000, img: 'zombie.jpg' },
        { id: 3, name: '포카리스웨트', price: 2200, img: 'pocari.jpg' },
        { id: 4, name: '파워에이드', price: 2200, img: 'powerade.jpg' },
        { id: 5, name: '제로콜라', price: 2200, img: 'zeroCola.jpg' },
        { id: 6, name: '메론소다', price: 2200, img: 'melonSoda.jpg' },
        { id: 7, name: '코코팜', price: 2200, img: 'cocopalm.jpg' }
    ],
    snacks: [
        { id: 8, name: '홈런볼', price: 2500, img: 'homerunBall.jpg' },
        { id: 9, name: '킨더 초콜렛', price: 2500, img: 'kinder.jpg' },
        { id: 10, name: '꼬깔콘', price: 2000, img: 'kokakorn.jpg' },
        { id: 11, name: '칸쵸', price: 2000, img: 'kancho.jpg' },
        { id: 12, name: '쫄병스낵', price: 2000, img: 'jjolbyeong.jpg' },
        { id: 13, name: '초코빵', price: 2000, img: 'chocoBread.jpg' },
        { id: 14, name: '허쉬쿠키', price: 1500, img: 'hersheyCookie.jpg' },
        { id: 15, name: '꼬미볼', price: 1200, img: 'gomiball.jpg' },
        { id: 16, name: '멘토스', price: 1200, img: 'mentos.jpg' },
        { id: 17, name: '몽쉘, 카스타드, 후레쉬베리', price: 800, img: 'mongshell.jpg' },
        { id: 18, name: '화이트하임, 초코쿠키', price: 600, img: 'whiteHeim.jpg' }
    ],
    desserts: [
        { id: 19, name: '컵라면', price: 2500, img: 'ramen.jpg' }
    ]
};

// 날짜별 매출 기록 초기화
const salesDateListAugust = document.getElementById('august');
const salesDateListSeptember = document.getElementById('september');

// 2024년 8월부터 2025년 12월까지의 날짜 목록 생성
const startDateAugust = new Date("2024-08-23");
const endDateDecember2025 = new Date("2025-12-31");

// 월별 목록을 담을 객체 생성
const monthSections = {};

function generateDateList(startDate, endDate) {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const yearMonth = currentDate.toISOString().split('T')[0].slice(0, 7); // "YYYY-MM" 형식
        const dateString = currentDate.toISOString().split('T')[0];

        if (!salesHistory[dateString]) {
            salesHistory[dateString] = [];
        }

        // 해당 월 섹션이 없으면 생성
        if (!monthSections[yearMonth]) {
            monthSections[yearMonth] = document.createElement('div');
            monthSections[yearMonth].classList.add('month-section');
            monthSections[yearMonth].innerHTML = `
                <h3 onclick="toggleMonth('${yearMonth}')">${yearMonth}</h3>
                <ul id="${yearMonth}" class="date-list" style="display:none;"></ul>
            `;
            document.getElementById('scrollableDateList').appendChild(monthSections[yearMonth]);
        }

        // 날짜 버튼 추가
        const listItem = document.createElement('li');
        listItem.innerHTML = `<button onclick="loadSalesDetails('${dateString}')">${dateString}</button>`;
        document.getElementById(yearMonth).appendChild(listItem);

        // 다음 날짜로 이동
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

generateDateList(startDateAugust, endDateDecember2025);


// 카테고리별로 상품 표시
function showCategory(category) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    products[category].forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <img src="images/${product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.price} 원</p>
        `;
        productItem.onclick = () => addToOrder(product);
        productsGrid.appendChild(productItem);
    });
}

// 주문 목록에 추가
function addToOrder(product) {
    const existingProduct = currentOrder.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        currentOrder.push({ ...product, quantity: 1 });
    }
    updateOrderSummary();
}

// 주문 목록 저장
function saveOrder(order) {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();
    
    order.forEach(item => {
        salesHistory[date].push({
            time: time,
            item: item.name,
            quantity: item.quantity,
            price: item.price * item.quantity
        });
    });
}

// 주문 목록 업데이트
function updateOrderSummary() {
    const orderList = document.getElementById('orderList');
    const totalPriceElement = document.getElementById('totalPrice');
    orderList.innerHTML = '';
    let totalPrice = 0;

    currentOrder.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${item.name} - ${item.price} 원 x ${item.quantity}
            <button onclick="changeQuantity(${item.id}, -1)">-</button>
            <button onclick="changeQuantity(${item.id}, 1)">+</button>
        `;
        orderList.appendChild(listItem);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = totalPrice;
}

// 수량 변경
function changeQuantity(productId, change) {
    const product = currentOrder.find(item => item.id === productId);
    if (product) {
        product.quantity += change;
        if (product.quantity <= 0) {
            currentOrder = currentOrder.filter(item => item.id !== productId);
        }
        updateOrderSummary();
    }
}

// 관리자 페이지 접근
document.getElementById('adminAccess').addEventListener('click', () => {
    adminTouchCount++;
    if (adminTouchCount >= 5) {
        document.getElementById('adminLoginPopup').style.display = 'flex';
        adminTouchCount = 0;
    }
});

// 관리자 로그인
document.getElementById('adminLoginButton').addEventListener('click', () => {
    const inputPassword = document.getElementById('adminPassword').value;
    if (inputPassword === adminPassword) {
        document.getElementById('adminLoginPopup').style.display = 'none';
        document.getElementById('adminPage').style.display = 'flex';
        loadSalesDetails(Object.keys(salesHistory)[0]);  // 첫 번째 날짜의 매출 내역 표시
    } else {
        alert('비밀번호가 틀렸습니다.');
    }
});

// 관리자 취소 버튼
document.getElementById('adminCancelButton').addEventListener('click', () => {
    document.getElementById('adminLoginPopup').style.display = 'none';
});

// 주문 확인 버튼
document.getElementById('confirmOrderButton').addEventListener('click', () => {
    // 기존 주문을 저장하고 초기화
    saveOrder(currentOrder);
    currentOrder = [];
    updateOrderSummary();

    // 기존 주문 팝업 닫기
    document.getElementById('orderPopup').style.display = 'none';

    // 새로운 팝업을 15초 동안 표시
    document.getElementById('confirmationPopup').style.display = 'flex';

    let countdownNumber = 15;
    const countdownElement = document.getElementById('countdownNumber');
    countdownElement.textContent = countdownNumber;

    // 카운트다운 시작
    const countdownInterval = setInterval(() => {
        countdownNumber--;
        countdownElement.textContent = countdownNumber;

        if (countdownNumber <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('confirmationPopup').style.display = 'none';
        }
    }, 1000); // 1초 간격으로 숫자 감소
});

// 주문 취소 버튼
document.getElementById('cancelOrderButton').addEventListener('click', () => {
    document.getElementById('orderPopup').style.display = 'none';
});

// 관리자 페이지에서 매출 내역 로드
function loadSalesDetails(date) {
    const salesDetails = document.getElementById('salesDetails');
    const salesDateElement = document.getElementById('salesDate');
    salesDateElement.textContent = date;
    salesDetails.innerHTML = '';
    let totalAmount = 0;
    let itemCounts = {
        monster: 0,
        zombie: 0,
        pocari: 0,
        powerade: 0,
        zeroCola: 0,
        melonSoda: 0,
        cocopalm: 0,
        homerunBall: 0,
        kinder: 0,
        kokakorn: 0,
        kancho: 0,
        jjolbyeong: 0,
        chocoBread: 0,
        hersheyCookie: 0,
        gomiball: 0,
        mentos: 0,
        mongshell: 0,
        whiteHeim: 0,
        ramen: 0
    };

    salesHistory[date].forEach((sale, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${sale.time}</td>
            <td>${sale.item}</td>
            <td>${sale.quantity}</td>
            <td>${sale.price}</td>
        `;
        salesDetails.appendChild(row);
        totalAmount += sale.price;

        // 판매된 품목 개수 계산
        const itemKey = getItemKey(sale.item);
        if (itemKey) {
            itemCounts[itemKey] += sale.quantity;
        }
    });

    document.getElementById('totalSalesAmount').textContent = totalAmount;

    // 각 품목의 팔린 개수 업데이트
    document.getElementById('sales_monster').textContent = itemCounts.monster;
    document.getElementById('sales_zombie').textContent = itemCounts.zombie;
    document.getElementById('sales_pocari').textContent = itemCounts.pocari;
    document.getElementById('sales_powerade').textContent = itemCounts.powerade;
    document.getElementById('sales_zeroCola').textContent = itemCounts.zeroCola;
    document.getElementById('sales_melonSoda').textContent = itemCounts.melonSoda;
    document.getElementById('sales_cocopalm').textContent = itemCounts.cocopalm;
    document.getElementById('sales_homerunBall').textContent = itemCounts.homerunBall;
    document.getElementById('sales_kinder').textContent = itemCounts.kinder;
    document.getElementById('sales_kokakorn').textContent = itemCounts.kokakorn;
    document.getElementById('sales_kancho').textContent = itemCounts.kancho;
    document.getElementById('sales_jjolbyeong').textContent = itemCounts.jjolbyeong;
    document.getElementById('sales_chocoBread').textContent = itemCounts.chocoBread;
    document.getElementById('sales_hersheyCookie').textContent = itemCounts.hersheyCookie;
    document.getElementById('sales_gomiball').textContent = itemCounts.gomiball;
    document.getElementById('sales_mentos').textContent = itemCounts.mentos;
    document.getElementById('sales_mongshell').textContent = itemCounts.mongshell;
    document.getElementById('sales_whiteHeim').textContent = itemCounts.whiteHeim;
    document.getElementById('sales_ramen').textContent = itemCounts.ramen;
}

// 품목 이름을 기준으로 키 반환
function getItemKey(itemName) {
    switch (itemName) {
        case '몬스터':
            return 'monster';
        case '좀비':
            return 'zombie';
        case '포카리스웨트':
            return 'pocari';
        case '파워에이드':
            return 'powerade';
        case '제로콜라':
            return 'zeroCola';
        case '메론소다':
            return 'melonSoda';
        case '코코팜':
            return 'cocopalm';
        case '홈런볼':
            return 'homerunBall';
        case '킨더 초콜렛':
            return 'kinder';
        case '꼬깔콘':
            return 'kokakorn';
        case '칸쵸':
            return 'kancho';
        case '쫄병스낵':
            return 'jjolbyeong';
        case '초코빵':
            return 'chocoBread';
        case '허쉬쿠키':
            return 'hersheyCookie';
        case '꼬미볼':
            return 'gomiball';
        case '멘토스':
            return 'mentos';
        case '몽쉘, 카스타드, 후레쉬베리':
            return 'mongshell';
        case '화이트하임, 초코쿠키':
            return 'whiteHeim';
        case '컵라면':
            return 'ramen';
        default:
            return null;
    }
}

// 월별 카테고리 토글
function toggleMonth(monthId) {
    const monthElement = document.getElementById(monthId);
    if (monthElement.style.display === 'none') {
        monthElement.style.display = 'block';
    } else {
        monthElement.style.display = 'none';
    }
}

// 판매 화면으로 돌아가기 버튼 클릭 시
document.getElementById('returnToSalesButton').addEventListener('click', () => {
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('adminLoginPopup').style.display = 'none';
});

// 초기 카테고리 로드
showCategory('drinks'); // 페이지가 로드될 때 초기 카테고리 표시

// 초기화 버튼 클릭 시 주문 목록 초기화
document.getElementById('clearOrderButton').onclick = () => {
    currentOrder = [];
    updateOrderSummary();
};
function exportToExcel() {
    const salesDetailsTable = document.querySelector('.admin-content table'); // 엑셀로 내보낼 테이블 선택
    const workbook = XLSX.utils.table_to_book(salesDetailsTable); // 테이블을 워크북으로 변환
    const date = document.getElementById('salesDate').textContent; // 파일 이름에 사용할 날짜 정보
    XLSX.writeFile(workbook, `SalesData_${date}.xlsx`); // 엑셀 파일로 저장
}

// 엑셀 내보내기 버튼 생성 및 이벤트 리스너 추가
const exportButton = document.createElement('button');
exportButton.textContent = '엑셀로 내보내기';
exportButton.classList.add('export-button'); // 필요한 경우 스타일 추가
exportButton.addEventListener('click', exportToExcel);

document.querySelector('.admin-content').appendChild(exportButton); // 관리 페이지에 버튼 추가
// 주문 목록 업데이트 및 로컬 스토리지에 저장
function updateOrderSummary() {
    const orderList = document.getElementById('orderList');
    const totalPriceElement = document.getElementById('totalPrice');
    orderList.innerHTML = '';
    let totalPrice = 0;

    currentOrder.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${item.name} - ${item.price} 원 x ${item.quantity}
            <button onclick="changeQuantity(${item.id}, -1)">-</button>
            <button onclick="changeQuantity(${item.id}, 1)">+</button>
        `;
        orderList.appendChild(listItem);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = totalPrice;

    // 로컬 스토리지에 현재 주문 데이터 저장
    localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
}
// 페이지 로드 시 로컬 스토리지에서 주문 데이터를 복원
document.addEventListener('DOMContentLoaded', () => {
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
        currentOrder = JSON.parse(savedOrder);
        updateOrderSummary();
    }
});
// 초기화 버튼 클릭 시 주문 목록 초기화 및 로컬 스토리지에서 제거
document.getElementById('clearOrderButton').onclick = () => {
    currentOrder = [];
    updateOrderSummary();
    localStorage.removeItem('currentOrder'); // 로컬 스토리지에서 삭제
};
function calculateMonthlySales(month) {
    const itemCounts = {
        monster: 0,
        zombie: 0,
        pocari: 0,
        powerade: 0,
        zeroCola: 0,
        melonSoda: 0,
        cocopalm: 0,
        homerunBall: 0,
        kinder: 0,
        kokakorn: 0,
        kancho: 0,
        jjolbyeong: 0,
        chocoBread: 0,
        hersheyCookie: 0,
        gomiball: 0,
        mentos: 0,
        mongshell: 0,
        whiteHeim: 0,
        ramen: 0
    };

    for (const date in salesHistory) {
        if (date.startsWith(month)) {
            salesHistory[date].forEach(sale => {
                const itemKey = getItemKey(sale.item);
                if (itemKey) {
                    itemCounts[itemKey] += sale.quantity;
                }
            });
        }
    }

    return itemCounts;
}
function exportMonthlySalesToExcel(month) {
    const salesData = calculateMonthlySales(month);
    const worksheetData = [];

    // 엑셀에 표시할 데이터를 배열로 준비
    worksheetData.push(['Item', 'Total Sold']);
    for (const item in salesData) {
        worksheetData.push([item, salesData[item]]);
    }

    // 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${month} Sales`);

    // 엑셀 파일로 저장
    XLSX.writeFile(workbook, `MonthlySales_${month}.xlsx`);
}
// 월별 정산 버튼 생성 및 이벤트 리스너 추가
const monthlyExportButton = document.createElement('button');
monthlyExportButton.textContent = '월별 정산';
monthlyExportButton.classList.add('export-button');
monthlyExportButton.addEventListener('click', () => {
    const month = prompt('엑셀로 내보낼 월을 입력하세요 (예: 2024-08)');
    if (month) {
        exportMonthlySalesToExcel(month);
    }
});

document.querySelector('.admin-content').appendChild(monthlyExportButton);

function updateOrderSummary() {
    const orderList = document.getElementById('orderList');
    const totalPriceElement = document.getElementById('totalPrice');
    orderList.innerHTML = '';
    let totalPrice = 0;

    currentOrder.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${item.name} - ${item.price} 원 x ${item.quantity}
            <div class="quantity-controls">
                <button onclick="changeQuantity(${item.id}, -1)">-</button>
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
            </div>
        `;
        listItem.classList.add('order-item');
        orderList.appendChild(listItem);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = totalPrice;
}

// 터치 이벤트를 통한 스크롤 기능 추가
const productsGrid = document.getElementById('productsGrid');
let startY;
let startScrollTop;

productsGrid.addEventListener('touchstart', function(e) {
    startY = e.touches[0].pageY;
    startScrollTop = productsGrid.scrollTop;
});

productsGrid.addEventListener('touchmove', function(e) {
    const touchY = e.touches[0].pageY;
    const moveY = startY - touchY;
    productsGrid.scrollTop = startScrollTop + moveY;
});
// 매일 오후 11시에 엑셀 파일로 저장하는 기능 추가
function autoSaveExcelAt11PM() {
    setInterval(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // 오후 11시 00분에 실행
        if (currentHour === 23 && currentMinute === 0) {
            const today = now.toISOString().split('T')[0];
            exportToExcelForDay(today);
        }
    }, 60000); // 1분 간격으로 현재 시간 확인
}

// 특정 날짜의 판매 데이터를 엑셀로 내보내는 함수
function exportToExcelForDay(date) {
    const salesDetails = salesHistory[date];
    if (!salesDetails) return;

    const worksheetData = [['Time', 'Item', 'Quantity', 'Price']];
    salesDetails.forEach(sale => {
        worksheetData.push([sale.time, sale.item, sale.quantity, sale.price]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${date} Sales`);

    XLSX.writeFile(workbook, `SalesData_${date}.xlsx`);
}

// 페이지 로드 시 자동 저장 기능 시작
document.addEventListener('DOMContentLoaded', () => {
    autoSaveExcelAt11PM();
});

// 기존 페이지 로드 시 주문 데이터 복원 코드
document.addEventListener('DOMContentLoaded', () => {
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
        currentOrder = JSON.parse(savedOrder);
        updateOrderSummary();
    }
});
