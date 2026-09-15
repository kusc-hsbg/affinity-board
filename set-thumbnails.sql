-- user_090406 각 글의 본문 첫 이미지를 카드 썸네일(thumb_url)로 설정
begin;

update public.posts set thumb_url = '/mirror/a/e0ba05baad46c34c.png' where student_id = 'user_090406' and category = '아트 에세이' and title = '11강';
update public.posts set thumb_url = '/mirror/a/6cad69fdbb5e0a67.png' where student_id = 'user_090406' and category = '아트 에세이' and title = '12강';
update public.posts set thumb_url = '/mirror/a/0ac8103bb6b7f906.png' where student_id = 'user_090406' and category = '아트 에세이' and title = '수료증';
update public.posts set thumb_url = '/mirror/a/cb520e23f79b98f4.jpeg' where student_id = 'user_090406' and category = '크리에이터 워크숍' and title = '1강';
update public.posts set thumb_url = '/mirror/a/30a9a1108a734b7f.png' where student_id = 'user_090406' and category = '크리에이터 워크숍' and title = '이번 단계 완료! 다음 성장을 향해 나아갑니다. 🚀';
update public.posts set thumb_url = '/mirror/a/30a9a1108a734b7f.png' where student_id = 'user_090406' and category = '스토리 크래프팅' and title = '이번 단계 완료! 다음 성장을 향해 나아갑니다. 🚀';
update public.posts set thumb_url = '/mirror/a/6290f94f8cd978ce.png' where student_id = 'user_090406' and category = '브랜드 디자인' and title = '축하합니다! 준원이의 소중한 배움이 마침내 빛나는 결실을 맺었습니다.';
update public.posts set thumb_url = '/mirror/a/e38a279d27361033.png' where student_id = 'user_090406' and category = '파운데이션' and title = '이번 단계 완료! 다음 성장을 향해 나아갑니다. 🚀';
update public.posts set thumb_url = '/mirror/a/6290f94f8cd978ce.png' where student_id = 'user_090406' and category = '마케팅' and title = '축하합니다! 준원이의 소중한 배움이 마침내 빛나는 결실을 맺었습니다.';

commit;
