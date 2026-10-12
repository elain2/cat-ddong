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
    trait: 'fur',
    text: '하루 중 가장 좋아하는 시간은?',
    options: [
      { label: '아침 햇살이 드는 시간', value: 'cream' },
      { label: '한낮의 따뜻한 햇볕', value: 'honey' },
      { label: '해질녘 노을', value: 'orange' },
      { label: '비 갠 뒤의 맑은 오후', value: 'blue' },
      { label: '코코아 한 잔이 생각나는 저녁', value: 'brown' },
      { label: '깊고 조용한 밤', value: 'black' },
      { label: '아직 아무도 안 깬 새벽', value: 'gray' },
      { label: '눈이 소복이 쌓인 날', value: 'white' },
    ],
  },
  {
    trait: 'accessory',
    text: '퇴근(하교) 후 저녁, 나의 선택은?',
    options: [
      { label: '회식이다! 넥타이 머리에 감고 달린다', value: 'tie' },
      { label: '카페에서 책 한 권', value: 'glasses' },
      { label: '집에서 혼술, 기분 좋게 한 병', value: 'bottle' },
      { label: '미술관 데이트, 베레모는 필수', value: 'beret' },
      { label: '소풍 가자! 도시락 싸서 한강으로', value: 'strawhat' },
      { label: '이어폰 끼고 혼자 산책', value: 'headphones' },
      { label: '친구 생일파티에 달려간다', value: 'partyhat' },
      { label: '바로 집으로, 자야지', value: 'none' },
    ],
  },
];
