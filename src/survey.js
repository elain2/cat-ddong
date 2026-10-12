// 질문 데이터. trait 값은 0/1/2 레벨 점수이고, fur/accessory는 문자열 값.
window.QUESTIONS = [
  {
    trait: 'energy',
    text: '쉬는 날 아침, 눈을 떴다. 지금 기분은?',
    options: [
      { label: '이불 속에서 한 시간은 더 있을 거야', value: 0 },
      { label: '일단 커피부터 마시고 생각해볼래', value: 1 },
      { label: '벌써 어디 갈지 검색 중!', value: 2 },
    ],
  },
  {
    trait: 'energy',
    text: '갑자기 하루가 통째로 비었다!',
    options: [
      { label: '집에서 아무것도 안 하기, 최고', value: 0 },
      { label: '동네 산책이나 하지 뭐', value: 1 },
      { label: '당장 처음 가보는 곳으로 출발', value: 2 },
    ],
  },
  {
    trait: 'social',
    text: '처음 보는 사람이 가득한 모임에 갔다.',
    options: [
      { label: '구석 자리에서 조용히 관찰한다', value: 0 },
      { label: '아는 사람 근처에 자리 잡는다', value: 1 },
      { label: '먼저 말 걸고 이름부터 묻는다', value: 2 },
    ],
  },
  {
    trait: 'social',
    text: '친구가 갑자기 "지금 볼래?" 하고 연락했다.',
    options: [
      { label: '…다음에 보자고 답장한다', value: 0 },
      { label: '10분 고민하다 나간다', value: 1 },
      { label: '이미 신발 신는 중', value: 2 },
    ],
  },
  {
    trait: 'delicacy',
    text: '내 방(책상) 상태는?',
    options: [
      { label: '어디에 뭐가 있는지는 나만 안다', value: 0 },
      { label: '대충 정리돼 있다', value: 1 },
      { label: '모든 물건에 제자리가 있다', value: 2 },
    ],
  },
  {
    trait: 'boldness',
    text: '처음 해보는 일 앞에서 나는?',
    options: [
      { label: '후기부터 찾아보고 신중하게 시작', value: 0 },
      { label: '해보면서 상황을 본다', value: 1 },
      { label: '일단 하고 본다', value: 2 },
    ],
  },
  {
    trait: 'pattern',
    text: '옷장 속 내 옷은 어떤 느낌이야?',
    options: [
      { label: '튀지 않는 무지 위주', value: 'plain' },
      { label: '스트라이프가 좋아', value: 'tabby' },
      { label: '도트(점박이)가 좋아', value: 'spots' },
      { label: '무채색인데 신발·모자로 포인트', value: 'point' },
    ],
  },
  {
    // 털색 = 시간대(밝기 4단계) x 분위기(따뜻/시원) 두 질문의 조합
    trait: 'furTone',
    text: '하루 중 가장 좋아하는 시간은?',
    options: [
      { label: '아침 햇살이 드는 시간', value: 0 },
      { label: '한낮의 느긋한 오후', value: 1 },
      { label: '해질녘 노을', value: 2 },
      { label: '깊고 조용한 밤', value: 3 },
    ],
  },
  {
    trait: 'furFamily',
    text: '쉬는 날, 어떤 분위기가 좋아?',
    options: [
      { label: '따뜻한 담요와 코코아 한 잔', value: 'warm' },
      { label: '시원한 바람과 청량한 음료', value: 'cool' },
    ],
  },
];
