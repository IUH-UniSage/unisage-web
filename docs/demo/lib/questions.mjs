// The questions the demo videos ask, shared by the recording scripts and warmup.mjs (which
// asks them ahead of recording so the retrieval cache already holds their results).

export const Q = {
  // Video 0
  scholarshipGuest: "hoc bong kkht loai gioi can diem hk va drl bao nhieu",
  // Video 1 (TST-CNPM-L1)
  fee: "hp dai hoc chinh quy khoa 2025 khoi cong nghe 1 tin chi ly thuyet bao nhieu",
  feeFollowUp: "còn khóa 2024 thì sao",
  // Cơ khí has public programmes for K14-K16, K18, K19, K21 - none for K22.
  // "Kinh tế chính trị Mác - Lênin": same name in the standard and "tăng cường tiếng Anh"
  // programmes (4203014165 / 4297013802, 2 credits). Not Tiếng Anh 1/2: the enhanced
  // programme calls them "Anh văn 1/2" and the answer said the standard programme lacks them,
  // its row not being retrieved (25/11/2026).
  englishK22:
    "chương trình đào tạo ngành công nghệ kỹ thuật cơ khí khóa 22: học phần kinh tế chính trị " +
    "mác - lênin có mã học phần là gì, bao nhiêu tín chỉ",
  // Video 2 and 3
  seminar: "seminar bo mon cnpm nam 26-27 to chuc luc may gio, phong nao vay",
  thesis: "diem khoa luan ktpm tinh trong so gvhd, phan bien, hoi dong the nao",
  observation: "gv moi bm ke toan phai duoc du gio it nhat may tiet nam 26-27",
  // Video 1, clarification part
  // Depends on the asker's programme, so an empty profile triggers the clarification panel.
  // (A fee question no longer does: the 2026-2027 registration rules give one flat fee.)
  creditsMine: "ngành của mình phải tích lũy bao nhiêu tín chỉ để tốt nghiệp",
  internshipMine: "ngành của mình có bao nhiêu tín chỉ thực tập tốt nghiệp",
  // Video 4 and 7: A1 (BM CNPM, cấp 1) - answered at level 1. Naming no attribute of the
  // asker on purpose: "giảng viên tiến sĩ ..." made the bot save "học vị: Tiến sĩ" into the
  // asker's profile and say so in the answer (25/11).
  advisorDeadline:
    "hạn chót nộp đơn đổi giảng viên hướng dẫn tốt nghiệp ktpm học kỳ này là ngày nào, dùng mẫu nào",
  // Video 4: only in A2 (cấp 2). Q.thesis is not usable there: a public QTDL thesis plan has
  // the same 20/30/50 weights, and the bot presents them as KTPM's (seen 25/11).
  thesisGap:
    "khi điểm gvhd và điểm phản biện khóa luận ktpm lệch nhau nhiều thì bộ môn cnpm xử lý ra sao",
  // Video 6: only in the demo document D1 (docs/demo/tai-lieu-demo), BM CNPM, cấp 3.
  gpu: "nhóm khóa luận được dùng tối đa bao nhiêu giờ GPU mỗi tháng trên máy chủ của bộ môn cnpm",
}

/** What warmup.mjs asks, per account (null = guest); a list is one conversation. */
export const WARMUP = [
  [null, [Q.scholarshipGuest]],
  [null, [Q.seminar]],
  ["cnpmL1", [Q.fee, Q.feeFollowUp]],
  ["cnpmL1", [Q.englishK22]],
  ["cnpmL0", [Q.seminar]],
  ["cnpmL0", [Q.thesisGap]],
  ["cnpmL2", [Q.thesisGap]],
  ["ktL5", [Q.seminar]],
  ["ktL5", [Q.observation]],
]
