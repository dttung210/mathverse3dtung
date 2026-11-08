/**
 * MATHVERSE CURRICULUM CHAPTER MANIFEST (TOÁN 6–12)
 * Bảng ánh xạ chuẩn hóa theo SGK: Lớp -> Tập -> Chương -> Bài -> Mô hình (310/310 mô hình)
 * Tự động tạo hệ Cổng Chương tỏa đều và phân khu Bài học bên trong phòng Triển lãm.
 */

export const CURRICULUM_CHAPTERS_MANIFEST = {
  version: "10.0.0",
  title: "Toán học 6–12 Chuẩn Bộ GD&ĐT",
  totalModels: 310,
  totalChapters: 58,
  grades: [
    {
      grade: 6,
      name: "Toán 6",
      totalModels: 64,
      accentHex: "#1abc9c",
      chapters: [
        {
          id: "G6-CH01",
          number: "I",
          title: "Tập hợp các số tự nhiên",
          volume: 1,
          lessons: [
            {
              lesson: 1,
              title: "Tập hợp",
              models: [
                { num: 1, id: "toan6-tap-hop-venn", name: "Sơ đồ tập hợp Venn", modality: "venn" }
              ]
            },
            {
              lesson: 2,
              title: "Cách ghi số tự nhiên",
              models: [
                { num: 2, id: "toan6-gia-tri-hang-so", name: "Bảng giá trị các chữ số", modality: "number" }
              ]
            },
            {
              lesson: 3,
              title: "Thứ tự trong tập hợp các số tự nhiên",
              models: [
                { num: 3, id: "toan6-truc-so-tu-nhien", name: "Trục số tự nhiên", modality: "number" }
              ]
            },
            {
              lesson: 4,
              title: "Phép cộng và phép trừ số tự nhiên",
              models: [
                { num: 4, id: "toan6-bac-thang-khoi", name: "Xếp bậc thang bằng khối lập phương", modality: "real" }
              ]
            },
            {
              lesson: 6,
              title: "Lũy thừa với số mũ tự nhiên",
              models: [
                { num: 5, id: "toan6-binh-phuong-luy-thua", name: "Mảng ô minh họa lũy thừa", modality: "number" }
              ]
            }
          ]
        },
        {
          id: "G6-CH02",
          number: "II",
          title: "Tính chia hết trong tập hợp các số tự nhiên",
          volume: 1,
          lessons: [
            {
              lesson: 8,
              title: "Quan hệ chia hết và tính chất",
              models: [
                { num: 6, id: "mv15-uoc-boi-bang100", name: "Ước và bội trên bảng 100", modality: "number" }
              ]
            },
            {
              lesson: 10,
              title: "Số nguyên tố",
              models: [
                { num: 7, id: "toan6-cay-thua-so", name: "Sơ đồ cây phân tích thừa số nguyên tố", modality: "number" },
                { num: 8, id: "mv15-nguyen-to-bang100", name: "Số nguyên tố trên bảng 100", modality: "number" }
              ]
            }
          ]
        },
        {
          id: "G6-CH03",
          number: "III",
          title: "Số nguyên",
          volume: 1,
          lessons: [
            {
              lesson: 13,
              title: "Tập hợp các số nguyên",
              models: [
                { num: 9, id: "toan6-nhiet-ke", name: "Nhiệt kế số âm và số dương", modality: "number" },
                { num: 10, id: "toan6-truc-so-nguyen", name: "Trục số nguyên", modality: "number" }
              ]
            },
            {
              lesson: 14,
              title: "Phép cộng và phép trừ số nguyên",
              models: [
                { num: 11, id: "toan6-buoc-nhay-so-nguyen", name: "Cộng/trừ số nguyên bằng bước nhảy", modality: "number" }
              ]
            }
          ]
        },
        {
          id: "G6-CH04",
          number: "IV",
          title: "Một số hình phẳng trong thực tiễn",
          volume: 1,
          lessons: [
            {
              lesson: 18,
              title: "Hình tam giác đều. Hình vuông. Hình lục giác đều",
              models: [
                { num: 12, id: "toan6-ghep-luc-giac", name: "Ghép lục giác bằng 6 tam giác", modality: "composition" },
                { num: 13, id: "toan6-ghep-vuong", name: "Gấp/cắt hình vuông thành tam giác", modality: "composition" },
                { num: 14, id: "toan6-hinh-vuong", name: "Hình vuông", modality: "polygon" },
                { num: 15, id: "toan6-lat-nen-da-giac", name: "Lát mặt phẳng bằng đa giác", modality: "tiling" },
                { num: 16, id: "toan6-luc-giac-deu", name: "Lục giác đều", modality: "polygon" },
                { num: 17, id: "toan6-tam-giac-deu", name: "Tam giác đều", modality: "polygon" }
              ]
            },
            {
              lesson: 19,
              title: "Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân",
              models: [
                { num: 18, id: "toan6-mat-bang-phong-hoc", name: "Bố trí phòng học hình chữ nhật", modality: "real" },
                { num: 19, id: "toan6-binh-hanh", name: "Hình bình hành", modality: "polygon" },
                { num: 20, id: "toan6-chu-nhat", name: "Hình chữ nhật", modality: "polygon" },
                { num: 21, id: "toan6-thang-can", name: "Hình thang cân", modality: "polygon" },
                { num: 22, id: "toan6-hinh-thoi", name: "Hình thoi", modality: "polygon" }
              ]
            },
            {
              lesson: 20,
              title: "Chu vi và diện tích của một số tứ giác đã học",
              models: [
                { num: 23, id: "toan6-cat-binh-hanh", name: "Cắt ghép diện tích hình bình hành", modality: "composition" },
                { num: 24, id: "toan6-cat-hinh-thoi", name: "Cắt ghép diện tích hình thoi", modality: "composition" },
                { num: 25, id: "toan6-dien-tich-ghep", name: "Diện tích hình ghép", modality: "composition" },
                { num: 26, id: "toan6-lat-gach-san", name: "Lát gạch nền thực tế", modality: "tiling" }
              ]
            }
          ]
        },
        {
          id: "G6-CH05",
          number: "V",
          title: "Tính đối xứng của hình phẳng trong tự nhiên",
          volume: 1,
          lessons: [
            {
              lesson: 21,
              title: "Hình có trục đối xứng",
              models: [
                { num: 27, id: "toan6-buom-doi-xung", name: "Cánh bướm đối xứng", modality: "symmetry" },
                { num: 28, id: "toan6-gap-ngoi-sao", name: "Gấp và cắt ngôi sao", modality: "symmetry" },
                { num: 29, id: "toan6-thiep-gap", name: "Tấm thiệp gấp", modality: "real" },
                { num: 30, id: "toan6-doi-xung-truc", name: "Đối xứng qua trục", modality: "symmetry" }
              ]
            },
            {
              lesson: 22,
              title: "Hình có tâm đối xứng",
              models: [
                { num: 31, id: "toan6-hoa-van-quay", name: "Hoa văn đối xứng tâm", modality: "symmetry" },
                { num: 32, id: "toan6-doi-xung-tam", name: "Đối xứng qua tâm", modality: "symmetry" }
              ]
            }
          ]
        },
        {
          id: "G6-CH06",
          number: "VI",
          title: "Phân số",
          volume: 2,
          lessons: [
            {
              lesson: 23,
              title: "Mở rộng phân số. Phân số bằng nhau",
              models: [
                { num: 33, id: "toan6-banh-phan-so", name: "Bánh tròn phân số", modality: "fraction" },
                { num: 34, id: "toan6-luoi-phan-so", name: "Lưới phần bằng nhau", modality: "fraction" },
                { num: 35, id: "toan6-phan-so-bang-nhau", name: "Phân số bằng nhau", modality: "fraction" },
                { num: 36, id: "toan6-thanh-phan-so", name: "Thanh biểu diễn phân số", modality: "fraction" }
              ]
            },
            {
              lesson: 24,
              title: "So sánh phân số. Hỗn số dương",
              models: [
                { num: 37, id: "toan6-so-sanh-phan-so", name: "So sánh hai phân số", modality: "fraction" }
              ]
            },
            {
              lesson: 25,
              title: "Phép cộng và phép trừ phân số",
              models: [
                { num: 38, id: "mv15-cong-phan-so-cung-mau", name: "Cộng hai phân số cùng mẫu", modality: "fraction" }
              ]
            },
            {
              lesson: 27,
              title: "Hai bài toán về phân số",
              models: [
                { num: 39, id: "toan6-phan-so-cua-so", name: "Tìm phân số của số cho trước", modality: "fraction" }
              ]
            }
          ]
        },
        {
          id: "G6-CH07",
          number: "VII",
          title: "Số thập phân",
          volume: 2,
          lessons: [
            {
              lesson: 28,
              title: "Số thập phân",
              models: [
                { num: 40, id: "toan6-hang-thap-phan", name: "Các hàng số thập phân", modality: "fraction" }
              ]
            },
            {
              lesson: 30,
              title: "Làm tròn và ước lượng",
              models: [
                { num: 41, id: "7-01-C03", name: "So sánh và làm tròn", modality: "NUMBER" }
              ]
            },
            {
              lesson: 31,
              title: "Một số bài toán về tỉ số và tỉ số phần trăm",
              models: [
                { num: 42, id: "toan6-luoi-100-phan-tram", name: "Tỉ số phần trăm và lưới 100 ô", modality: "fraction" }
              ]
            }
          ]
        },
        {
          id: "G6-CH08",
          number: "VIII",
          title: "Những hình hình học cơ bản",
          volume: 2,
          lessons: [
            {
              lesson: 32,
              title: "Điểm và đường thẳng",
              models: [
                { num: 43, id: "toan6-hai-duong-thang", name: "Hai đường thẳng song song/cắt/trùng", modality: "geometry" },
                { num: 44, id: "toan6-diem-thuoc-duong", name: "Điểm thuộc/không thuộc đường", modality: "geometry" },
                { num: 45, id: "toan6-giao-lo", name: "Đường giao thông giao nhau", modality: "real" }
              ]
            },
            {
              lesson: 33,
              title: "Điểm nằm giữa hai điểm. Tia",
              models: [
                { num: 46, id: "toan6-ba-diem-thang-hang", name: "Ba điểm thẳng hàng", modality: "geometry" },
                { num: 47, id: "toan6-hai-tia-doi-nhau", name: "Hai tia đối nhau", modality: "geometry" }
              ]
            },
            {
              lesson: 34,
              title: "Đoạn thẳng. Độ dài đoạn thẳng",
              models: [
                { num: 48, id: "toan6-do-doan-thang", name: "Thước đo đoạn thẳng", modality: "geometry" }
              ]
            },
            {
              lesson: 35,
              title: "Trung điểm của đoạn thẳng",
              models: [
                { num: 49, id: "toan6-trung-diem", name: "Trung điểm của đoạn thẳng", modality: "geometry" }
              ]
            },
            {
              lesson: 36,
              title: "Góc",
              models: [
                { num: 50, id: "toan6-goc-dong", name: "Góc động hai tia", modality: "geometry" },
                { num: 51, id: "toan6-vong-quay-choi", name: "Vòng đu quay", modality: "real" }
              ]
            },
            {
              lesson: 37,
              title: "Số đo góc",
              models: [
                { num: 52, id: "toan6-dong-ho-goc", name: "Góc tạo bởi hai kim đồng hồ", modality: "geometry" },
                { num: 53, id: "toan6-phan-loai-goc", name: "Phân loại góc", modality: "geometry" }
              ]
            }
          ]
        },
        {
          id: "G6-CH09",
          number: "IX",
          title: "Dữ liệu và xác suất thực nghiệm",
          volume: 2,
          lessons: [
            {
              lesson: 38,
              title: "Dữ liệu và thu thập dữ liệu",
              models: [
                { num: 54, id: "toan6-bang-thu-thap", name: "Bảng dữ liệu thu thập", modality: "chart" }
              ]
            },
            {
              lesson: 39,
              title: "Bảng thống kê và biểu đồ tranh",
              models: [
                { num: 55, id: "toan6-bieu-do-tranh", name: "Biểu đồ tranh", modality: "chart" },
                { num: 56, id: "toan6-bang-kiem-dem", name: "Vạch kiểm đếm", modality: "chart" }
              ]
            },
            {
              lesson: 40,
              title: "Biểu đồ cột",
              models: [
                { num: 57, id: "toan6-cot-don", name: "Biểu đồ cột đơn", modality: "chart" },
                { num: 58, id: "toan6-cot-ngang", name: "Biểu đồ thanh ngang", modality: "chart" }
              ]
            },
            {
              lesson: 41,
              title: "Biểu đồ cột kép",
              models: [
                { num: 59, id: "toan6-cot-kep", name: "Biểu đồ cột kép", modality: "chart" }
              ]
            },
            {
              lesson: 42,
              title: "Kết quả có thể và sự kiện trong trò chơi, thí nghiệm",
              models: [
                { num: 60, id: "toan6-xuc-xac", name: "Gieo xúc xắc sáu mặt", modality: "chance" },
                { num: 61, id: "toan6-o-tu-ti", name: "Oẳn tù tì", modality: "chance" },
                { num: 62, id: "toan6-rut-bong", name: "Rút bóng màu từ túi", modality: "chance" }
              ]
            },
            {
              lesson: 43,
              title: "Xác suất thực nghiệm",
              models: [
                { num: 63, id: "toan6-dong-xu", name: "Tung đồng xu", modality: "chance" },
                { num: 64, id: "toan6-vong-quay", name: "Vòng quay may mắn", modality: "chance" }
              ]
            }
          ]
        }
      ]
    },
    {
      grade: 7,
      name: "Toán 7",
      totalModels: 38,
      accentHex: "#3498db",
      chapters: [
        {
          id: "G7-CH01",
          number: "I",
          title: "Số hữu tỉ",
          volume: 1,
          lessons: [
            {
              lesson: 1,
              title: "Tập hợp các số hữu tỉ",
              models: [
                { num: 65, id: "7-01-C01", name: "Số hữu tỉ trên trục số", modality: "NUMBER" }
              ]
            }
          ]
        },
        {
          id: "G7-CH02",
          number: "II",
          title: "Số thực",
          volume: 1,
          lessons: [
            {
              lesson: 6,
              title: "Số vô tỉ. Căn bậc hai số học",
              models: [
                { num: 66, id: "7-01-C02", name: "Số thực và căn bậc hai", modality: "NUMBER" }
              ]
            }
          ]
        },
        {
          id: "G7-CH03",
          number: "III",
          title: "Góc và đường thẳng song song",
          volume: 1,
          lessons: [
            {
              lesson: 8,
              title: "Góc ở vị trí đặc biệt. Tia phân giác của một góc",
              models: [
                { num: 67, id: "7-02-C01", name: "Hai góc kề bù", modality: "PLANE" },
                { num: 68, id: "7-02-C02", name: "Hai góc đối đỉnh", modality: "PLANE" }
              ]
            },
            {
              lesson: 9,
              title: "Hai đường thẳng song song và dấu hiệu nhận biết",
              models: [
                { num: 69, id: "7-02-C05", name: "Dấu hiệu nhận biết song song", modality: "PLANE" },
                { num: 70, id: "7-02-C03", name: "Góc đồng vị khi có cát tuyến", modality: "PLANE" }
              ]
            },
            {
              lesson: 10,
              title: "Tiên đề Euclid. Tính chất của hai đường thẳng song song",
              models: [
                { num: 71, id: "7-02-C04", name: "Góc so le trong và trong cùng phía", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G7-CH04",
          number: "IV",
          title: "Tam giác bằng nhau",
          volume: 1,
          lessons: [
            {
              lesson: 12,
              title: "Tổng các góc trong một tam giác",
              models: [
                { num: 72, id: "7-03-C02", name: "Góc ngoài tam giác", modality: "PLANE" },
                { num: 73, id: "7-03-C01", name: "Tổng ba góc trong tam giác", modality: "PLANE" }
              ]
            },
            {
              lesson: 13,
              title: "Hai tam giác bằng nhau. Trường hợp bằng nhau thứ nhất của tam giác",
              models: [
                { num: 74, id: "7-04-C01", name: "Bằng nhau c.c.c", modality: "PLANE" }
              ]
            },
            {
              lesson: 14,
              title: "Trường hợp bằng nhau thứ hai và thứ ba của tam giác",
              models: [
                { num: 75, id: "7-04-C02", name: "Bằng nhau c.g.c", modality: "PLANE" },
                { num: 76, id: "7-04-C03", name: "Bằng nhau g.c.g", modality: "PLANE" }
              ]
            },
            {
              lesson: 15,
              title: "Các trường hợp bằng nhau của tam giác vuông",
              models: [
                { num: 77, id: "7-04-C05", name: "Tam giác vuông: cạnh góc vuông và góc nhọn kề", modality: "PLANE" },
                { num: 78, id: "7-04-C07", name: "Tam giác vuông: cạnh huyền và cạnh góc vuông", modality: "PLANE" },
                { num: 79, id: "7-04-C06", name: "Tam giác vuông: cạnh huyền và góc nhọn", modality: "PLANE" },
                { num: 80, id: "7-04-C04", name: "Tam giác vuông: hai cạnh góc vuông", modality: "PLANE" }
              ]
            },
            {
              lesson: 16,
              title: "Tam giác cân. Đường trung trực của đoạn thẳng",
              models: [
                { num: 81, id: "7-05-C05", name: "Dựng đường trung trực bằng thước và compa", modality: "PLANE" },
                { num: 82, id: "7-03-C05", name: "Tam giác cân và tam giác đều", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G7-CH05",
          number: "V",
          title: "Thu thập và biểu diễn dữ liệu",
          volume: 1,
          lessons: [
            {
              lesson: 18,
              title: "Biểu đồ hình quạt tròn",
              models: [
                { num: 83, id: "7-06-C01", name: "Biểu đồ quạt tròn từ bảng số liệu", modality: "STAT" },
                { num: 84, id: "7-06-C02", name: "So sánh phần trăm", modality: "STAT" },
                { num: 85, id: "7-06-C03", name: "Từ biểu đồ cột sang quạt tròn", modality: "STAT" }
              ]
            },
            {
              lesson: 19,
              title: "Biểu đồ đoạn thẳng",
              models: [
                { num: 86, id: "7-07-C01", name: "Biểu đồ đoạn thẳng theo thời gian", modality: "STAT" },
                { num: 87, id: "7-07-C02", name: "So sánh xu hướng tăng giảm", modality: "STAT" }
              ]
            }
          ]
        },
        {
          id: "G7-CH08",
          number: "VIII",
          title: "Làm quen với biến cố và xác suất của biến cố",
          volume: 2,
          lessons: [
            {
              lesson: 29,
              title: "Làm quen với biến cố",
              models: [
                { num: 88, id: "7-10-C01", name: "Phép thử ngẫu nhiên", modality: "PROB" }
              ]
            }
          ]
        },
        {
          id: "G7-CH09",
          number: "IX",
          title: "Quan hệ giữa các yếu tố trong một tam giác",
          volume: 2,
          lessons: [
            {
              lesson: 31,
              title: "Quan hệ giữa góc và cạnh đối diện trong một tam giác",
              models: [
                { num: 89, id: "7-03-C03", name: "Góc và cạnh đối diện", modality: "PLANE" }
              ]
            },
            {
              lesson: 33,
              title: "Quan hệ giữa ba cạnh của một tam giác",
              models: [
                { num: 90, id: "7-03-C04", name: "Bất đẳng thức tam giác", modality: "PLANE" }
              ]
            },
            {
              lesson: 34,
              title: "Sự đồng quy của ba đường trung tuyến, ba đường phân giác trong một tam giác",
              models: [
                { num: 91, id: "7-05-C02", name: "Ba đường phân giác và tâm nội tiếp", modality: "PLANE" },
                { num: 92, id: "7-05-C01", name: "Ba đường trung tuyến và trọng tâm", modality: "PLANE" }
              ]
            },
            {
              lesson: 35,
              title: "Sự đồng quy của ba đường trung trực, ba đường cao trong một tam giác",
              models: [
                { num: 93, id: "7-05-C04", name: "Ba đường cao và trực tâm", modality: "PLANE" },
                { num: 94, id: "7-05-C03", name: "Ba đường trung trực và tâm ngoại tiếp", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G7-CH10",
          number: "X",
          title: "Một số hình khối trong thực tiễn",
          volume: 2,
          lessons: [
            {
              lesson: 36,
              title: "Hình hộp chữ nhật và hình lập phương",
              models: [
                { num: 95, id: "7-08-C04", name: "Diện tích và thể tích", modality: "SOLID" },
                { num: 96, id: "7-08-C01", name: "Hình hộp chữ nhật: mặt cạnh đỉnh", modality: "SOLID" },
                { num: 97, id: "7-08-C02", name: "Hình lập phương", modality: "SOLID" },
                { num: 98, id: "7-08-C03", name: "Khai triển hình hộp", modality: "SOLID" }
              ]
            },
            {
              lesson: 37,
              title: "Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác",
              models: [
                { num: 99, id: "7-09-C04", name: "Diện tích xung quanh và thể tích", modality: "SOLID" },
                { num: 100, id: "7-09-C03", name: "Khai triển lăng trụ", modality: "SOLID" },
                { num: 101, id: "7-09-C01", name: "Lăng trụ đứng tam giác", modality: "SOLID" },
                { num: 102, id: "7-09-C02", name: "Lăng trụ đứng tứ giác", modality: "SOLID" }
              ]
            }
          ]
        }
      ]
    },
    {
      grade: 8,
      name: "Toán 8",
      totalModels: 40,
      accentHex: "#e67e22",
      chapters: [
        {
          id: "G8-CH02",
          number: "II",
          title: "Hằng đẳng thức đáng nhớ và ứng dụng",
          volume: 1,
          lessons: [
            {
              lesson: 6,
              title: "Hiệu hai bình phương. Bình phương của một tổng hay một hiệu",
              models: [
                { num: 103, id: "8-01-C01", name: "Bình phương một tổng và một hiệu", modality: "PLANE" },
                { num: 104, id: "8-01-C02", name: "Hiệu hai bình phương", modality: "PLANE" }
              ]
            },
            {
              lesson: 7,
              title: "Lập phương của một tổng. Lập phương của một hiệu",
              models: [
                { num: 105, id: "8-01-C03", name: "Lập phương và tổng/hiệu hai lập phương", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G8-CH03",
          number: "III",
          title: "Tứ giác",
          volume: 1,
          lessons: [
            {
              lesson: 11,
              title: "Hình thang cân",
              models: [
                { num: 106, id: "8-02-C01", name: "Hình thang cân", modality: "PLANE" }
              ]
            },
            {
              lesson: 12,
              title: "Hình bình hành",
              models: [
                { num: 107, id: "8-02-C02", name: "Hình bình hành", modality: "PLANE" }
              ]
            },
            {
              lesson: 13,
              title: "Hình chữ nhật",
              models: [
                { num: 108, id: "8-02-C03", name: "Hình chữ nhật", modality: "PLANE" }
              ]
            },
            {
              lesson: 14,
              title: "Hình thoi và hình vuông",
              models: [
                { num: 109, id: "8-02-C04", name: "Hình thoi", modality: "PLANE" },
                { num: 110, id: "8-02-C05", name: "Hình vuông", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G8-CH04",
          number: "IV",
          title: "Định lí Thalès",
          volume: 1,
          lessons: [
            {
              lesson: 15,
              title: "Định lí Thalès trong tam giác",
              models: [
                { num: 111, id: "8-03-C01", name: "Định lí Thalès thuận", modality: "PLANE" },
                { num: 112, id: "8-03-C02", name: "Định lí Thalès đảo", modality: "PLANE" }
              ]
            },
            {
              lesson: 16,
              title: "Đường trung bình của tam giác",
              models: [
                { num: 113, id: "8-03-C03", name: "Đường trung bình tam giác", modality: "PLANE" }
              ]
            },
            {
              lesson: 17,
              title: "Tính chất đường phân giác của tam giác",
              models: [
                { num: 114, id: "8-04-C02", name: "Phân giác trong kết hợp Thalès", modality: "PLANE" },
                { num: 115, id: "8-04-C01", name: "Đường phân giác trong tam giác", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G8-CH05",
          number: "V",
          title: "Dữ liệu và biểu đồ",
          volume: 1,
          lessons: [
            {
              lesson: 19,
              title: "Biểu diễn dữ liệu bằng bảng, biểu đồ",
              models: [
                { num: 116, id: "8-08-C01", name: "Bảng số liệu sang biểu đồ", modality: "STAT" }
              ]
            },
            {
              lesson: 20,
              title: "Phân tích số liệu thống kê dựa vào biểu đồ",
              models: [
                { num: 117, id: "8-08-C02", name: "Phân tích và đối chiếu biểu đồ", modality: "STAT" }
              ]
            }
          ]
        },
        {
          id: "G8-CH07",
          number: "VII",
          title: "Phương trình bậc nhất và hàm số bậc nhất",
          volume: 2,
          lessons: [
            {
              lesson: 28,
              title: "Hàm số bậc nhất và đồ thị của hàm số bậc nhất",
              models: [
                { num: 118, id: "8-07-C01", name: "Đồ thị y=ax+b", modality: "GRAPH" }
              ]
            },
            {
              lesson: 29,
              title: "Hệ số góc của đường thẳng",
              models: [
                { num: 119, id: "8-07-C02", name: "Hệ số góc", modality: "GRAPH" },
                { num: 120, id: "8-07-C03", name: "So sánh hai đường thẳng", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G8-CH08",
          number: "VIII",
          title: "Mở đầu về tính xác suất của biến cố",
          volume: 2,
          lessons: [
            {
              lesson: 30,
              title: "Kết quả có thể và kết quả thuận lợi",
              models: [
                { num: 121, id: "8-08-C03", name: "Kết quả có thể và kết quả thuận lợi khi gieo xúc xắc", modality: "STAT" }
              ]
            },
            {
              lesson: 31,
              title: "Cách tính xác suất của biến cố bằng tỉ số",
              models: [
                { num: 122, id: "8-08-C04", name: "Xác suất theo tỉ số: bốc bóng", modality: "STAT" },
                { num: 123, id: "7-10-C02", name: "Xác suất trong mô hình đồng khả năng", modality: "PROB" }
              ]
            },
            {
              lesson: 32,
              title: "Mối liên hệ giữa xác suất thực nghiệm với xác suất và ứng dụng",
              models: [
                { num: 124, id: "9-13-C03", name: "Thực nghiệm và thống kê kết quả", modality: "PROB" },
                { num: 125, id: "7-10-C03", name: "Tần suất thực nghiệm", modality: "PROB" },
                { num: 126, id: "8-08-C05", name: "Xác suất thực nghiệm: tung đồng xu", modality: "STAT" }
              ]
            }
          ]
        },
        {
          id: "G8-CH09",
          number: "IX",
          title: "Tam giác đồng dạng",
          volume: 2,
          lessons: [
            {
              lesson: 33,
              title: "Hai tam giác đồng dạng",
              models: [
                { num: 127, id: "8-06-C07", name: "Định lí đồng dạng và đường song song", modality: "PLANE" }
              ]
            },
            {
              lesson: 34,
              title: "Ba trường hợp đồng dạng của hai tam giác",
              models: [
                { num: 128, id: "8-06-C01", name: "Đồng dạng c.c.c", modality: "PLANE" },
                { num: 129, id: "8-06-C02", name: "Đồng dạng c.g.c", modality: "PLANE" },
                { num: 130, id: "8-06-C03", name: "Đồng dạng g.g", modality: "PLANE" }
              ]
            },
            {
              lesson: 35,
              title: "Định lí Pythagore và ứng dụng",
              models: [
                { num: 131, id: "8-05-C01", name: "Định lí Pythagore", modality: "PLANE" },
                { num: 132, id: "8-05-C02", name: "Định lí Pythagore đảo", modality: "PLANE" },
                { num: 133, id: "8-05-C03", name: "Ứng dụng đo độ dài", modality: "PLANE" }
              ]
            },
            {
              lesson: 36,
              title: "Các trường hợp đồng dạng của hai tam giác vuông",
              models: [
                { num: 134, id: "8-06-C06", name: "Tam giác vuông: cạnh huyền và một cạnh góc vuông tỉ lệ", modality: "PLANE" },
                { num: 135, id: "8-06-C05", name: "Tam giác vuông: hai cạnh góc vuông tỉ lệ", modality: "PLANE" },
                { num: 136, id: "8-06-C04", name: "Tam giác vuông: một góc nhọn bằng nhau", modality: "PLANE" }
              ]
            },
            {
              lesson: 37,
              title: "Hình đồng dạng",
              models: [
                { num: 137, id: "8-06-C09", name: "Hình đồng dạng", modality: "PLANE" },
                { num: 138, id: "8-06-C08", name: "Hình đồng dạng qua phép vị tự (phối cảnh tâm O)", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G8-CH10",
          number: "X",
          title: "Một số hình khối trong thực tiễn",
          volume: 2,
          lessons: [
            {
              lesson: 38,
              title: "Hình chóp tam giác đều",
              models: [
                { num: 139, id: "8-09-C04", name: "Diện tích xung quanh và thể tích", modality: "SOLID" },
                { num: 140, id: "8-09-C01", name: "Hình chóp tam giác đều", modality: "SOLID" },
                { num: 141, id: "8-09-C03", name: "Khai triển hình chóp đều", modality: "SOLID" }
              ]
            },
            {
              lesson: 39,
              title: "Hình chóp tứ giác đều",
              models: [
                { num: 142, id: "8-09-C02", name: "Hình chóp tứ giác đều", modality: "SOLID" }
              ]
            }
          ]
        }
      ]
    },
    {
      grade: 9,
      name: "Toán 9",
      totalModels: 45,
      accentHex: "#e74c3c",
      chapters: [
        {
          id: "G9-CH01",
          number: "I",
          title: "Phương trình và hệ hai phương trình bậc nhất hai ẩn",
          volume: 1,
          lessons: [
            {
              lesson: 2,
              title: "Giải hệ hai phương trình bậc nhất hai ẩn",
              models: [
                { num: 143, id: "9-01-C01", name: "Hệ hai phương trình: nghiệm duy nhất", modality: "GRAPH" },
                { num: 144, id: "9-01-C02", name: "Hệ vô nghiệm", modality: "GRAPH" },
                { num: 145, id: "9-01-C03", name: "Hệ vô số nghiệm", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G9-CH02",
          number: "II",
          title: "Phương trình và bất phương trình bậc nhất một ẩn",
          volume: 1,
          lessons: [
            {
              lesson: 6,
              title: "Bất phương trình bậc nhất một ẩn",
              models: [
                { num: 146, id: "9-02-C01", name: "Bất phương trình bậc nhất một ẩn", modality: "NUMBER" },
                { num: 147, id: "9-02-C02", name: "Giao các điều kiện", modality: "NUMBER" }
              ]
            }
          ]
        },
        {
          id: "G9-CH04",
          number: "IV",
          title: "Hệ thức lượng trong tam giác vuông",
          volume: 1,
          lessons: [
            {
              lesson: 11,
              title: "Tỉ số lượng giác của góc nhọn",
              models: [
                { num: 148, id: "9-03-C01", name: "Sin và cos góc nhọn", modality: "PLANE" },
                { num: 149, id: "9-03-C02", name: "Tan và cot góc nhọn", modality: "PLANE" }
              ]
            },
            {
              lesson: 12,
              title: "Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng",
              models: [
                { num: 150, id: "9-03-C03", name: "Giải tam giác vuông", modality: "PLANE" },
                { num: 151, id: "9-04-C01", name: "Đo chiều cao từ góc nâng", modality: "REAL" },
                { num: 152, id: "9-04-C02", name: "Đo khoảng cách không tiếp cận trực tiếp", modality: "REAL" }
              ]
            }
          ]
        },
        {
          id: "G9-CH05",
          number: "V",
          title: "Đường tròn",
          volume: 1,
          lessons: [
            {
              lesson: 14,
              title: "Cung và dây của một đường tròn",
              models: [
                { num: 153, id: "9-05-C01", name: "Dây cung và đường kính", modality: "PLANE" },
                { num: 154, id: "9-05-C02", name: "Góc ở tâm và số đo cung", modality: "PLANE" }
              ]
            },
            {
              lesson: 15,
              title: "Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên",
              models: [
                { num: 155, id: "9-05-C04", name: "Diện tích quạt và vành khuyên", modality: "PLANE" },
                { num: 156, id: "9-05-C03", name: "Độ dài cung tròn", modality: "PLANE" }
              ]
            },
            {
              lesson: 16,
              title: "Vị trí tương đối của đường thẳng và đường tròn",
              models: [
                { num: 157, id: "9-06-C01", name: "Đường thẳng và đường tròn: cắt nhau", modality: "PLANE" },
                { num: 158, id: "9-06-C03", name: "Đường thẳng và đường tròn: không giao", modality: "PLANE" },
                { num: 159, id: "9-06-C02", name: "Đường thẳng và đường tròn: tiếp xúc", modality: "PLANE" }
              ]
            },
            {
              lesson: 17,
              title: "Vị trí tương đối của hai đường tròn",
              models: [
                { num: 160, id: "9-06-C04", name: "Hai đường tròn cắt nhau", modality: "PLANE" },
                { num: 161, id: "9-06-C06", name: "Hai đường tròn rời nhau/chứa nhau/trùng nhau", modality: "PLANE" },
                { num: 162, id: "9-06-C05", name: "Hai đường tròn tiếp xúc trong/ngoài", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G9-CH06",
          number: "VI",
          title: "Hàm số y=ax² (a≠0). Phương trình bậc hai một ẩn",
          volume: 2,
          lessons: [
            {
              lesson: 18,
              title: "Hàm số y=ax² (a≠0)",
              models: [
                { num: 163, id: "9-08-C03", name: "Bảng giá trị và các điểm đối xứng", modality: "GRAPH" },
                { num: 164, id: "9-08-C02", name: "Đồ thị y=ax² với a<0", modality: "GRAPH" },
                { num: 165, id: "9-08-C01", name: "Đồ thị y=ax² với a>0", modality: "GRAPH" }
              ]
            },
            {
              lesson: 19,
              title: "Phương trình bậc hai một ẩn",
              models: [
                { num: 166, id: "9-08-C04", name: "Nghiệm phương trình bậc hai: phân biệt, kép, vô nghiệm", modality: "GRAPH" }
              ]
            },
            {
              lesson: 20,
              title: "Định lí Viète và ứng dụng",
              models: [
                { num: 167, id: "9-08-C05", name: "Hệ thức Viète của hai nghiệm phương trình bậc hai", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G9-CH07",
          number: "VII",
          title: "Tần số và tần số tương đối",
          volume: 2,
          lessons: [
            {
              lesson: 22,
              title: "Bảng tần số và biểu đồ tần số",
              models: [
                { num: 168, id: "9-12-C01", name: "Tần số của dữ liệu", modality: "STAT" }
              ]
            },
            {
              lesson: 23,
              title: "Bảng tần số tương đối và biểu đồ tần số tương đối",
              models: [
                { num: 169, id: "9-12-C02", name: "Tần số tương đối", modality: "STAT" }
              ]
            },
            {
              lesson: 24,
              title: "Bảng tần số, tần số tương đối ghép nhóm và biểu đồ",
              models: [
                { num: 170, id: "9-12-C03", name: "Dữ liệu ghép nhóm", modality: "STAT" }
              ]
            }
          ]
        },
        {
          id: "G9-CH08",
          number: "VIII",
          title: "Xác suất của biến cố trong một số mô hình xác suất đơn giản",
          volume: 2,
          lessons: [
            {
              lesson: 25,
              title: "Phép thử ngẫu nhiên và không gian mẫu",
              models: [
                { num: 171, id: "9-13-C01", name: "Phép thử với không gian mẫu hữu hạn", modality: "PROB" }
              ]
            },
            {
              lesson: 26,
              title: "Xác suất của biến cố liên quan tới phép thử",
              models: [
                { num: 172, id: "9-13-C02", name: "Phép thử liên quan tổ hợp đơn giản", modality: "PROB" }
              ]
            }
          ]
        },
        {
          id: "G9-CH09",
          number: "IX",
          title: "Đường tròn ngoại tiếp và đường tròn nội tiếp",
          volume: 2,
          lessons: [
            {
              lesson: 27,
              title: "Góc nội tiếp",
              models: [
                { num: 173, id: "9-07-C02", name: "Các góc nội tiếp cùng chắn một cung", modality: "PLANE" },
                { num: 174, id: "9-07-C01", name: "Góc nội tiếp và góc ở tâm", modality: "PLANE" }
              ]
            },
            {
              lesson: 28,
              title: "Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác",
              models: [
                { num: 175, id: "9-07-C03", name: "Đường tròn ngoại tiếp tam giác", modality: "PLANE" },
                { num: 176, id: "9-07-C04", name: "Đường tròn nội tiếp tam giác", modality: "PLANE" }
              ]
            },
            {
              lesson: 29,
              title: "Tứ giác nội tiếp",
              models: [
                { num: 177, id: "9-07-C05", name: "Tứ giác nội tiếp", modality: "PLANE" }
              ]
            },
            {
              lesson: 30,
              title: "Đa giác đều",
              models: [
                { num: 178, id: "9-07-C06", name: "Đa giác đều và các đường tròn liên quan", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G9-CH10",
          number: "X",
          title: "Một số hình khối trong thực tiễn",
          volume: 2,
          lessons: [
            {
              lesson: 31,
              title: "Hình trụ và hình nón",
              models: [
                { num: 179, id: "9-10-C03", name: "Diện tích và thể tích hình nón", modality: "SOLID" },
                { num: 180, id: "9-09-C03", name: "Diện tích và thể tích hình trụ", modality: "SOLID" },
                { num: 181, id: "9-10-C01", name: "Hình nón và đường sinh", modality: "SOLID" },
                { num: 182, id: "9-09-C01", name: "Hình trụ và yếu tố", modality: "SOLID" },
                { num: 183, id: "9-10-C02", name: "Khai triển mặt xung quanh hình nón", modality: "SOLID" },
                { num: 184, id: "9-09-C02", name: "Khai triển mặt xung quanh hình trụ", modality: "SOLID" }
              ]
            },
            {
              lesson: 32,
              title: "Hình cầu",
              models: [
                { num: 185, id: "9-11-C02", name: "Diện tích mặt cầu và thể tích khối cầu", modality: "SOLID" },
                { num: 186, id: "9-11-C01", name: "Mặt cầu và hình cầu", modality: "SOLID" },
                { num: 187, id: "9-11-C03", name: "Mặt cắt qua hình cầu [mở rộng trực quan]", modality: "SOLID" }
              ]
            }
          ]
        }
      ]
    },
    {
      grade: 10,
      name: "Toán 10",
      totalModels: 38,
      accentHex: "#9b59b6",
      chapters: [
        {
          id: "G10-CH01",
          number: "I",
          title: "Mệnh đề và tập hợp",
          volume: 1,
          lessons: [
            {
              lesson: 2,
              title: "Tập hợp và các phép toán trên tập hợp",
              models: [
                { num: 188, id: "10-01-C01", name: "Giao và hợp tập hợp", modality: "PLANE" },
                { num: 189, id: "10-01-C02", name: "Hiệu hai tập hợp", modality: "PLANE" },
                { num: 190, id: "10-01-C04", name: "Khoảng, đoạn và phép toán trên trục số", modality: "PLANE" },
                { num: 191, id: "10-01-C03", name: "Phần bù tập hợp", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G10-CH02",
          number: "II",
          title: "Bất phương trình và hệ bất phương trình bậc nhất hai ẩn",
          volume: 1,
          lessons: [
            {
              lesson: 3,
              title: "Bất phương trình bậc nhất hai ẩn",
              models: [
                { num: 192, id: "10-02-C01", name: "Miền nghiệm bất phương trình bậc nhất hai ẩn", modality: "GRAPH" }
              ]
            },
            {
              lesson: 4,
              title: "Hệ bất phương trình bậc nhất hai ẩn",
              models: [
                { num: 193, id: "10-02-C03", name: "Bài toán tối ưu tuyến tính trực quan [mở rộng / vận dụng]", modality: "GRAPH" },
                { num: 194, id: "10-02-C02", name: "Hệ bất phương trình hai ẩn", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G10-CH03",
          number: "III",
          title: "Hệ thức lượng trong tam giác",
          volume: 1,
          lessons: [
            {
              lesson: 6,
              title: "Hệ thức lượng trong tam giác",
              models: [
                { num: 195, id: "10-03-C03", name: "Diện tích tam giác", modality: "PLANE" },
                { num: 196, id: "10-03-C01", name: "Định lí cosin", modality: "PLANE" },
                { num: 197, id: "10-03-C02", name: "Định lí sin", modality: "PLANE" }
              ]
            }
          ]
        },
        {
          id: "G10-CH04",
          number: "IV",
          title: "Vectơ",
          volume: 1,
          lessons: [
            {
              lesson: 8,
              title: "Tổng và hiệu của hai vectơ",
              models: [
                { num: 198, id: "10-04-C02", name: "Hiệu hai vectơ", modality: "PLANE" },
                { num: 199, id: "10-04-C01", name: "Tổng hai vectơ", modality: "PLANE" }
              ]
            },
            {
              lesson: 9,
              title: "Tích của một vectơ với một số",
              models: [
                { num: 200, id: "10-04-C03", name: "Nhân vectơ với một số", modality: "PLANE" }
              ]
            },
            {
              lesson: 10,
              title: "Vectơ trong mặt phẳng tọa độ",
              models: [
                { num: 201, id: "10-05-C02", name: "Tính độ dài vectơ", modality: "GRAPH" },
                { num: 202, id: "10-05-C01", name: "Tọa độ vectơ và điểm trong Oxy", modality: "GRAPH" }
              ]
            },
            {
              lesson: 11,
              title: "Tích vô hướng của hai vectơ",
              models: [
                { num: 203, id: "10-04-C04", name: "Tích vô hướng", modality: "PLANE" },
                { num: 204, id: "10-05-C03", name: "Tích vô hướng theo tọa độ", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G10-CH05",
          number: "V",
          title: "Các số đặc trưng của mẫu số liệu không ghép nhóm",
          volume: 1,
          lessons: [
            {
              lesson: 12,
              title: "Số gần đúng và sai số",
              models: [
                { num: 205, id: "10-10-C04", name: "Số gần đúng và sai số tuyệt đối", modality: "STAT" }
              ]
            },
            {
              lesson: 13,
              title: "Các số đặc trưng đo xu thế trung tâm",
              models: [
                { num: 206, id: "10-10-C01", name: "Số trung bình, trung vị, mốt", modality: "STAT" }
              ]
            },
            {
              lesson: 14,
              title: "Các số đặc trưng đo độ phân tán",
              models: [
                { num: 207, id: "10-10-C02", name: "Khoảng biến thiên và tứ phân vị", modality: "STAT" },
                { num: 208, id: "10-10-C03", name: "Phương sai, độ lệch chuẩn", modality: "STAT" }
              ]
            }
          ]
        },
        {
          id: "G10-CH06",
          number: "VI",
          title: "Hàm số, đồ thị và ứng dụng",
          volume: 2,
          lessons: [
            {
              lesson: 16,
              title: "Hàm số bậc hai",
              models: [
                { num: 209, id: "10-06-C02", name: "Hàm bậc hai a<0", modality: "GRAPH" },
                { num: 210, id: "10-06-C01", name: "Hàm bậc hai a>0", modality: "GRAPH" },
                { num: 211, id: "10-06-C03", name: "Trục đối xứng và giao điểm", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G10-CH07",
          number: "VII",
          title: "Phương pháp tọa độ trong mặt phẳng",
          volume: 2,
          lessons: [
            {
              lesson: 19,
              title: "Phương trình đường thẳng",
              models: [
                { num: 212, id: "10-07-C02", name: "Phương trình tham số đường thẳng", modality: "GRAPH" },
                { num: 213, id: "10-07-C01", name: "Phương trình tổng quát đường thẳng", modality: "GRAPH" }
              ]
            },
            {
              lesson: 20,
              title: "Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách",
              models: [
                { num: 214, id: "10-07-C04", name: "Khoảng cách từ điểm đến đường thẳng", modality: "GRAPH" },
                { num: 215, id: "10-07-C03", name: "Vị trí tương đối và góc giữa hai đường", modality: "GRAPH" }
              ]
            },
            {
              lesson: 21,
              title: "Đường tròn trong mặt phẳng tọa độ",
              models: [
                { num: 216, id: "10-08-C03", name: "Tiếp tuyến đường tròn", modality: "GRAPH" },
                { num: 217, id: "10-08-C01", name: "Tâm và bán kính đường tròn", modality: "GRAPH" },
                { num: 218, id: "10-08-C02", name: "Tương giao đường thẳng và đường tròn", modality: "GRAPH" }
              ]
            },
            {
              lesson: 22,
              title: "Ba đường conic",
              models: [
                { num: 219, id: "10-09-C01", name: "Elip", modality: "GRAPH" },
                { num: 220, id: "10-09-C02", name: "Hypebol", modality: "GRAPH" },
                { num: 221, id: "10-09-C03", name: "Parabol conic", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G10-CH08",
          number: "VIII",
          title: "Đại số tổ hợp",
          volume: 2,
          lessons: [
            {
              lesson: 23,
              title: "Quy tắc đếm",
              models: [
                { num: 222, id: "10-11-C01", name: "Quy tắc đếm cộng và nhân", modality: "PROB" }
              ]
            },
            {
              lesson: 24,
              title: "Hoán vị, chỉnh hợp và tổ hợp",
              models: [
                { num: 223, id: "10-11-C02", name: "Hoán vị, chỉnh hợp, tổ hợp", modality: "PROB" }
              ]
            },
            {
              lesson: 25,
              title: "Nhị thức Newton",
              models: [
                { num: 224, id: "10-11-C04", name: "Nhị thức Newton và tam giác Pascal", modality: "PROB" }
              ]
            }
          ]
        },
        {
          id: "G10-CH09",
          number: "IX",
          title: "Tính xác suất theo định nghĩa cổ điển",
          volume: 2,
          lessons: [
            {
              lesson: 26,
              title: "Biến cố và định nghĩa cổ điển của xác suất",
              models: [
                { num: 225, id: "10-11-C03", name: "Xác suất cổ điển", modality: "PROB" }
              ]
            }
          ]
        }
      ]
    },
    {
      grade: 11,
      name: "Toán 11",
      totalModels: 46,
      accentHex: "#2ecc71",
      chapters: [
        {
          id: "G11-CH01",
          number: "I",
          title: "Hàm số lượng giác và phương trình lượng giác",
          volume: 1,
          lessons: [
            {
              lesson: 1,
              title: "Giá trị lượng giác của góc lượng giác",
              models: [
                { num: 226, id: "11-01-C01", name: "Góc lượng giác có hướng", modality: "PLANE" },
                { num: 227, id: "11-01-C02", name: "Đường tròn lượng giác", modality: "PLANE" },
                { num: 228, id: "11-01-C03", name: "Độ dài cung", modality: "PLANE" }
              ]
            },
            {
              lesson: 2,
              title: "Công thức lượng giác",
              models: [
                { num: 229, id: "11-01-C04", name: "Công thức cộng lượng giác", modality: "PLANE" }
              ]
            },
            {
              lesson: 3,
              title: "Hàm số lượng giác",
              models: [
                { num: 230, id: "11-02-C02", name: "Đồ thị y=cos x", modality: "GRAPH" },
                { num: 231, id: "11-02-C04", name: "Đồ thị y=cot x", modality: "GRAPH" },
                { num: 232, id: "11-02-C01", name: "Đồ thị y=sin x", modality: "GRAPH" },
                { num: 233, id: "11-02-C03", name: "Đồ thị y=tan x", modality: "GRAPH" }
              ]
            },
            {
              lesson: 4,
              title: "Phương trình lượng giác cơ bản",
              models: [
                { num: 234, id: "11-02-C05", name: "Phương trình sin x = m và cos x = m", modality: "GRAPH" },
                { num: 235, id: "11-02-C06", name: "Phương trình tan x = m và cot x = m", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G11-CH02",
          number: "II",
          title: "Dãy số. Cấp số cộng và cấp số nhân",
          volume: 1,
          lessons: [
            {
              lesson: 5,
              title: "Dãy số",
              models: [
                { num: 236, id: "11-03-C01", name: "Dãy số theo quy luật", modality: "GRAPH" }
              ]
            },
            {
              lesson: 6,
              title: "Cấp số cộng",
              models: [
                { num: 237, id: "11-03-C02", name: "Cấp số cộng", modality: "GRAPH" }
              ]
            },
            {
              lesson: 7,
              title: "Cấp số nhân",
              models: [
                { num: 238, id: "11-03-C03", name: "Cấp số nhân", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G11-CH03",
          number: "III",
          title: "Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm",
          volume: 1,
          lessons: [
            {
              lesson: 8,
              title: "Mẫu số liệu ghép nhóm",
              models: [
                { num: 239, id: "11-04-C01", name: "Bảng tần số ghép nhóm", modality: "STAT" }
              ]
            },
            {
              lesson: 9,
              title: "Các số đặc trưng đo xu thế trung tâm",
              models: [
                { num: 240, id: "11-04-C02", name: "Số trung bình ghép nhóm", modality: "STAT" },
                { num: 241, id: "11-04-C03", name: "Trung vị và tứ phân vị ghép nhóm", modality: "STAT" }
              ]
            }
          ]
        },
        {
          id: "G11-CH04",
          number: "IV",
          title: "Quan hệ song song trong không gian",
          volume: 1,
          lessons: [
            {
              lesson: 10,
              title: "Đường thẳng và mặt phẳng trong không gian",
              models: [
                { num: 242, id: "11-05-C02", name: "Giao tuyến hai mặt phẳng", modality: "SOLID" },
                { num: 243, id: "11-05-C03", name: "Hai đường thẳng chéo nhau", modality: "SOLID" },
                { num: 244, id: "11-05-C01", name: "Đường thẳng và mặt phẳng trong không gian", modality: "SOLID" }
              ]
            },
            {
              lesson: 11,
              title: "Hai đường thẳng song song",
              models: [
                { num: 245, id: "11-06-C01", name: "Hai đường thẳng song song", modality: "SOLID" }
              ]
            },
            {
              lesson: 12,
              title: "Đường thẳng và mặt phẳng song song",
              models: [
                { num: 246, id: "11-06-C02", name: "Đường thẳng song song mặt phẳng", modality: "SOLID" }
              ]
            },
            {
              lesson: 13,
              title: "Hai mặt phẳng song song",
              models: [
                { num: 247, id: "11-06-C03", name: "Hai mặt phẳng song song", modality: "SOLID" }
              ]
            },
            {
              lesson: 14,
              title: "Phép chiếu song song",
              models: [
                { num: 248, id: "11-06-C04", name: "Phép chiếu song song", modality: "SOLID" }
              ]
            }
          ]
        },
        {
          id: "G11-CH05",
          number: "V",
          title: "Giới hạn. Hàm số liên tục",
          volume: 1,
          lessons: [
            {
              lesson: 15,
              title: "Giới hạn của dãy số",
              models: [
                { num: 249, id: "11-10-C01", name: "Giới hạn dãy số", modality: "GRAPH" }
              ]
            },
            {
              lesson: 16,
              title: "Giới hạn của hàm số",
              models: [
                { num: 250, id: "11-10-C02", name: "Giới hạn hàm số một phía/hai phía", modality: "GRAPH" }
              ]
            },
            {
              lesson: 17,
              title: "Hàm số liên tục",
              models: [
                { num: 251, id: "11-10-C03", name: "Hàm số liên tục và gián đoạn", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G11-CH06",
          number: "VI",
          title: "Hàm số mũ và hàm số lôgarit",
          volume: 2,
          lessons: [
            {
              lesson: 20,
              title: "Hàm số mũ và hàm số lôgarit",
              models: [
                { num: 252, id: "11-11-C02", name: "Hàm số logarit", modality: "GRAPH" },
                { num: 253, id: "11-11-C01", name: "Hàm số mũ", modality: "GRAPH" },
                { num: 254, id: "11-11-C03", name: "Tính chất hai hàm ngược nhau", modality: "GRAPH" }
              ]
            }
          ]
        },
        {
          id: "G11-CH07",
          number: "VII",
          title: "Quan hệ vuông góc trong không gian",
          volume: 2,
          lessons: [
            {
              lesson: 22,
              title: "Hai đường thẳng vuông góc",
              models: [
                { num: 255, id: "11-07-C01", name: "Hai đường thẳng vuông góc", modality: "SOLID" }
              ]
            },
            {
              lesson: 23,
              title: "Đường thẳng vuông góc với mặt phẳng",
              models: [
                { num: 256, id: "11-07-C02", name: "Đường thẳng vuông góc mặt phẳng", modality: "SOLID" }
              ]
            },
            {
              lesson: 24,
              title: "Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng",
              models: [
                { num: 257, id: "11-08-C01", name: "Góc giữa đường thẳng và mặt phẳng", modality: "SOLID" }
              ]
            },
            {
              lesson: 25,
              title: "Hai mặt phẳng vuông góc",
              models: [
                { num: 258, id: "11-08-C02", name: "Góc nhị diện giữa hai mặt phẳng", modality: "SOLID" },
                { num: 259, id: "11-07-C03", name: "Hai mặt phẳng vuông góc", modality: "SOLID" }
              ]
            },
            {
              lesson: 26,
              title: "Khoảng cách",
              models: [
                { num: 260, id: "11-08-C04", name: "Khoảng cách hai đường chéo nhau", modality: "SOLID" },
                { num: 261, id: "11-08-C03", name: "Khoảng cách điểm-mặt phẳng", modality: "SOLID" }
              ]
            },
            {
              lesson: 27,
              title: "Thể tích",
              models: [
                { num: 262, id: "11-09-C03", name: "Thể tích chóp cụt [mở rộng / vận dụng]", modality: "SOLID" },
                { num: 263, id: "11-09-C02", name: "Thể tích hình chóp", modality: "SOLID" },
                { num: 264, id: "11-09-C01", name: "Thể tích hình lăng trụ", modality: "SOLID" }
              ]
            }
          ]
        },
        {
          id: "G11-CH08",
          number: "VIII",
          title: "Các quy tắc tính xác suất",
          volume: 2,
          lessons: [
            {
              lesson: 28,
              title: "Biến cố hợp, biến cố giao, biến cố độc lập",
              models: [
                { num: 265, id: "11-13-C01", name: "Biến cố hợp và giao", modality: "PROB" }
              ]
            },
            {
              lesson: 29,
              title: "Công thức cộng xác suất",
              models: [
                { num: 266, id: "11-13-C02", name: "Biến cố xung khắc", modality: "PROB" }
              ]
            },
            {
              lesson: 30,
              title: "Công thức nhân xác suất cho hai biến cố độc lập",
              models: [
                { num: 267, id: "11-13-C03", name: "Biến cố độc lập", modality: "PROB" }
              ]
            }
          ]
        },
        {
          id: "G11-CH09",
          number: "IX",
          title: "Đạo hàm",
          volume: 2,
          lessons: [
            {
              lesson: 31,
              title: "Định nghĩa và ý nghĩa của đạo hàm",
              models: [
                { num: 268, id: "11-12-C02", name: "Cát tuyến tiến tới tiếp tuyến", modality: "GRAPH" },
                { num: 269, id: "11-12-C01", name: "Hệ số góc tiếp tuyến", modality: "GRAPH" }
              ]
            },
            {
              lesson: 32,
              title: "Các quy tắc tính đạo hàm",
              models: [
                { num: 270, id: "11-12-C03", name: "Đồ thị hàm đạo hàm", modality: "GRAPH" }
              ]
            },
            {
              lesson: 33,
              title: "Đạo hàm cấp hai",
              models: [
                { num: 271, id: "11-12-C04", name: "Đạo hàm cấp hai", modality: "GRAPH" }
              ]
            }
          ]
        }
      ]
    },
    {
      grade: 12,
      name: "Toán 12",
      totalModels: 39,
      accentHex: "#f39c12",
      chapters: [
        {
          id: "G12-CH01",
          number: "I",
          title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
          volume: 1,
          lessons: [
            {
              lesson: 1,
              title: "Tính đơn điệu và cực trị của hàm số",
              models: [
                { num: 272, id: "12-01-C02", name: "Cực đại và cực tiểu", modality: "GRAPH" },
                { num: 273, id: "12-01-C01", name: "Khoảng đồng biến và nghịch biến", modality: "GRAPH" }
              ]
            },
            {
              lesson: 2,
              title: "Giá trị lớn nhất và giá trị nhỏ nhất của hàm số",
              models: [
                { num: 274, id: "12-01-C03", name: "Giá trị lớn nhất, nhỏ nhất trên đoạn", modality: "GRAPH" }
              ]
            },
            {
              lesson: 3,
              title: "Đường tiệm cận của đồ thị hàm số",
              models: [
                { num: 275, id: "12-02-C04", name: "Tiệm cận ngang và tiệm cận xiên", modality: "GRAPH" },
                { num: 276, id: "12-02-C03", name: "Tiệm cận đứng", modality: "GRAPH" }
              ]
            },
            {
              lesson: 4,
              title: "Khảo sát sự biến thiên và vẽ đồ thị của hàm số",
              models: [
                { num: 277, id: "12-01-C04", name: "Bảng biến thiên và đồ thị", modality: "GRAPH" },
                { num: 278, id: "12-02-C01", name: "Hàm bậc ba", modality: "GRAPH" },
                { num: 279, id: "12-02-C02", name: "Hàm phân thức bậc nhất/bậc nhất", modality: "GRAPH" }
              ]
            },
            {
              lesson: 5,
              title: "Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn",
              models: [
                { num: 280, id: "12-03-C01", name: "Tối ưu diện tích hình phẳng", modality: "REAL" },
                { num: 281, id: "12-03-C02", name: "Tối ưu hình hộp không nắp", modality: "REAL" },
                { num: 282, id: "12-03-C03", name: "Tối ưu mô hình chuyển động/doanh thu", modality: "REAL" }
              ]
            }
          ]
        },
        {
          id: "G12-CH02",
          number: "II",
          title: "Vectơ và hệ trục tọa độ trong không gian",
          volume: 1,
          lessons: [
            {
              lesson: 6,
              title: "Vectơ trong không gian",
              models: [
                { num: 283, id: "12-04-C02", name: "Vectơ trong Oxyz", modality: "SOLID" }
              ]
            },
            {
              lesson: 7,
              title: "Hệ trục tọa độ trong không gian",
              models: [
                { num: 284, id: "12-04-C01", name: "Điểm trong hệ Oxyz", modality: "SOLID" }
              ]
            },
            {
              lesson: 8,
              title: "Biểu thức tọa độ của các phép toán vectơ",
              models: [
                { num: 285, id: "12-04-C04", name: "Tổng hai vectơ trong Oxyz", modality: "SOLID" },
                { num: 286, id: "12-04-C03", name: "Độ dài và tích vô hướng vectơ", modality: "SOLID" }
              ]
            }
          ]
        },
        {
          id: "G12-CH03",
          number: "III",
          title: "Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm",
          volume: 1,
          lessons: [
            {
              lesson: 9,
              title: "Khoảng biến thiên và khoảng tứ phân vị",
              models: [
                { num: 287, id: "12-05-C01", name: "Khoảng biến thiên của dữ liệu ghép nhóm", modality: "STAT" },
                { num: 288, id: "12-05-C02", name: "Khoảng tứ phân vị ghép nhóm", modality: "STAT" }
              ]
            },
            {
              lesson: 10,
              title: "Phương sai và độ lệch chuẩn",
              models: [
                { num: 289, id: "12-05-C03", name: "Phương sai và độ lệch chuẩn ghép nhóm", modality: "STAT" }
              ]
            }
          ]
        },
        {
          id: "G12-CH04",
          number: "IV",
          title: "Nguyên hàm và tích phân",
          volume: 2,
          lessons: [
            {
              lesson: 11,
              title: "Nguyên hàm",
              models: [
                { num: 290, id: "12-06-C01", name: "Nguyên hàm và đạo hàm", modality: "GRAPH" }
              ]
            },
            {
              lesson: 12,
              title: "Tích phân",
              models: [
                { num: 291, id: "12-06-C02", name: "Tích phân xác định", modality: "GRAPH" }
              ]
            },
            {
              lesson: 13,
              title: "Ứng dụng hình học của tích phân",
              models: [
                { num: 292, id: "12-06-C03", name: "Diện tích hình phẳng", modality: "GRAPH" },
                { num: 293, id: "12-07-C01", name: "Khối tròn xoay quanh Ox", modality: "SOLID" },
                { num: 294, id: "12-07-C02", name: "Khối tròn xoay với lỗ rỗng [tùy trường hợp]", modality: "SOLID" },
                { num: 295, id: "12-07-C03", name: "Mặt cắt và phương pháp tích phân", modality: "SOLID" }
              ]
            }
          ]
        },
        {
          id: "G12-CH05",
          number: "V",
          title: "Phương pháp tọa độ trong không gian",
          volume: 2,
          lessons: [
            {
              lesson: 14,
              title: "Phương trình mặt phẳng",
              models: [
                { num: 296, id: "12-08-C03", name: "Khoảng cách điểm-mặt phẳng", modality: "SOLID" },
                { num: 297, id: "12-08-C01", name: "Mặt phẳng qua điểm có vectơ pháp tuyến", modality: "SOLID" },
                { num: 298, id: "12-08-C02", name: "Vị trí tương đối hai mặt phẳng", modality: "SOLID" }
              ]
            },
            {
              lesson: 15,
              title: "Phương trình đường thẳng trong không gian",
              models: [
                { num: 299, id: "12-09-C02", name: "Phương trình tham số và chính tắc", modality: "SOLID" },
                { num: 300, id: "12-09-C03", name: "Vị trí tương đối hai đường trong không gian", modality: "SOLID" },
                { num: 301, id: "12-09-C01", name: "Đường thẳng qua điểm và vectơ chỉ phương", modality: "SOLID" }
              ]
            },
            {
              lesson: 16,
              title: "Công thức tính góc trong không gian",
              models: [
                { num: 302, id: "12-08-C04", name: "Góc giữa hai mặt phẳng", modality: "SOLID" },
                { num: 303, id: "12-09-C04", name: "Góc giữa đường thẳng và mặt phẳng", modality: "SOLID" }
              ]
            },
            {
              lesson: 17,
              title: "Phương trình mặt cầu",
              models: [
                { num: 304, id: "12-10-C01", name: "Mặt cầu trong Oxyz", modality: "SOLID" },
                { num: 305, id: "12-10-C02", name: "Mặt phẳng cắt/tiếp xúc mặt cầu", modality: "SOLID" },
                { num: 306, id: "12-10-C03", name: "Đường thẳng và mặt cầu [mở rộng trực quan]", modality: "SOLID" }
              ]
            }
          ]
        },
        {
          id: "G12-CH06",
          number: "VI",
          title: "Xác suất có điều kiện",
          volume: 2,
          lessons: [
            {
              lesson: 18,
              title: "Xác suất có điều kiện",
              models: [
                { num: 307, id: "12-11-C02", name: "Công thức nhân xác suất", modality: "PROB" },
                { num: 308, id: "12-11-C01", name: "Xác suất có điều kiện", modality: "PROB" }
              ]
            },
            {
              lesson: 19,
              title: "Công thức xác suất toàn phần và công thức Bayes",
              models: [
                { num: 309, id: "12-11-C04", name: "Công thức xác suất toàn phần", modality: "PROB" },
                { num: 310, id: "12-11-C03", name: "Sơ đồ cây Bayes", modality: "PROB" }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Lab mapping & 5 relocated models audit metadata (GDPT 2018 – Kết nối tri thức với cuộc sống)
export const GRADE6_LAB_BY_MODEL_ID = {
  "toan6-tap-hop-venn": "G6-R03-L01",
  "toan6-gia-tri-hang-so": "G6-R03-L01",
  "toan6-truc-so-tu-nhien": "G6-R03-L01",
  "toan6-bac-thang-khoi": "G6-R03-L01",
  "toan6-binh-phuong-luy-thua": "G6-R03-L01",
  "mv15-uoc-boi-bang100": "G6-R03-L01",
  "toan6-cay-thua-so": "G6-R03-L01",
  "mv15-nguyen-to-bang100": "G6-R03-L01",
  "toan6-nhiet-ke": "G6-R03-L01",
  "toan6-truc-so-nguyen": "G6-R03-L01",
  "toan6-buoc-nhay-so-nguyen": "G6-R03-L01",
  "toan6-ghep-luc-giac": "G6-R01-L02",
  "toan6-ghep-vuong": "G6-R01-L02",
  "toan6-hinh-vuong": "G6-R01-L01",
  "toan6-lat-nen-da-giac": "G6-R01-L02",
  "toan6-luc-giac-deu": "G6-R01-L01",
  "toan6-tam-giac-deu": "G6-R01-L01",
  "toan6-mat-bang-phong-hoc": "G6-R04-L03",
  "toan6-binh-hanh": "G6-R01-L01",
  "toan6-chu-nhat": "G6-R01-L01",
  "toan6-thang-can": "G6-R01-L01",
  "toan6-hinh-thoi": "G6-R01-L01",
  "toan6-cat-binh-hanh": "G6-R01-L02",
  "toan6-cat-hinh-thoi": "G6-R01-L02",
  "toan6-dien-tich-ghep": "G6-R01-L02",
  "toan6-lat-gach-san": "G6-R01-L02",
  "toan6-buom-doi-xung": "G6-R02-L01",
  "toan6-gap-ngoi-sao": "G6-R02-L01",
  "toan6-thiep-gap": "G6-R04-L03",
  "toan6-doi-xung-truc": "G6-R02-L01",
  "toan6-hoa-van-quay": "G6-R02-L01",
  "toan6-doi-xung-tam": "G6-R02-L01",
  "toan6-banh-phan-so": "G6-R03-L02",
  "toan6-luoi-phan-so": "G6-R03-L02",
  "toan6-phan-so-bang-nhau": "G6-R03-L02",
  "toan6-thanh-phan-so": "G6-R03-L02",
  "toan6-so-sanh-phan-so": "G6-R03-L02",
  "mv15-cong-phan-so-cung-mau": "G6-R03-L02",
  "toan6-phan-so-cua-so": "G6-R03-L02",
  "toan6-hang-thap-phan": "G6-R03-L02",
  "toan6-luoi-100-phan-tram": "G6-R03-L02",
  "toan6-hai-duong-thang": "G6-R02-L02",
  "toan6-diem-thuoc-duong": "G6-R02-L02",
  "toan6-giao-lo": "G6-R04-L03",
  "toan6-ba-diem-thang-hang": "G6-R02-L02",
  "toan6-hai-tia-doi-nhau": "G6-R02-L02",
  "toan6-do-doan-thang": "G6-R02-L02",
  "toan6-trung-diem": "G6-R02-L02",
  "toan6-goc-dong": "G6-R02-L02",
  "toan6-vong-quay-choi": "G6-R04-L03",
  "toan6-dong-ho-goc": "G6-R02-L02",
  "toan6-phan-loai-goc": "G6-R02-L02",
  "toan6-bang-thu-thap": "G6-R04-L01",
  "toan6-bieu-do-tranh": "G6-R04-L01",
  "toan6-bang-kiem-dem": "G6-R04-L01",
  "toan6-cot-don": "G6-R04-L01",
  "toan6-cot-ngang": "G6-R04-L01",
  "toan6-cot-kep": "G6-R04-L01",
  "toan6-xuc-xac": "G6-R04-L02",
  "toan6-o-tu-ti": "G6-R04-L02",
  "toan6-rut-bong": "G6-R04-L02",
  "toan6-dong-xu": "G6-R04-L02",
  "toan6-vong-quay": "G6-R04-L02"
};

export const RELOCATED_MODEL_OVERRIDES = {
  "toan6-bac-thang-khoi": { sourceGrade: 6, targetGrade: 6, sourceLabId: "G6-R04-L03", targetLabId: "G6-R03-L01" },
  "7-01-C03": { sourceGrade: 7, targetGrade: 6, sourceLabId: "7-01", targetLabId: "G6-R03-L02" },
  "7-10-C02": { sourceGrade: 7, targetGrade: 8, sourceLabId: "7-10", targetLabId: "8-08" },
  "9-13-C03": { sourceGrade: 9, targetGrade: 8, sourceLabId: "9-13", targetLabId: "8-08" },
  "7-10-C03": { sourceGrade: 7, targetGrade: 8, sourceLabId: "7-10", targetLabId: "8-08" }
};

// V4 Pedagogical Alignment & Scope Metadata (15 V4-CN items + Section IV supplementary scope notes)
export const V4_MODEL_PEDAGOGY_NOTES = {
  "8-01-C03": {
    v4Code: "V4-CN-01",
    level: "adjust_lesson_mode",
    badge: "Phân tách Bài 7 & Bài 8",
    lessonScopes: [
      { lesson: 7, label: "Bài 7: (a+b)³, (a−b)³", variants: ["cubeSum", "cubeDiff"] },
      { lesson: 8, label: "Bài 8: a³+b³, a³−b³", variants: ["sumCubes", "diffCubes"] }
    ],
    scopeNote: "Bài 7 trọng tâm khai triển (a+b)³ và (a−b)³ theo 8 khối hộp; Bài 8 trọng tâm phân tích a³+b³ = (a+b)(a²−ab+b²) và a³−b³ = (a−b)(a²+ab+b²)."
  },
  "8-08-C03": {
    v4Code: "V4-CN-02",
    level: "adjust_lesson_mode",
    badge: "Phân tách Bài 30 & Bài 31",
    lessonScopes: [
      { lesson: 30, label: "Bài 30: Ω = {1..6} & kết quả thuận lợi k" },
      { lesson: 31, label: "Bài 31: Tỉ số P(A) = k/6 (xúc xắc cân đối)" }
    ],
    scopeNote: "Bài 30 chỉ liệt kê không gian mẫu Ω = {1,2,3,4,5,6} và đếm số kết quả thuận lợi k; công thức tỉ số P(A) = k/6 với giả thiết đồng khả năng thuộc Bài 31."
  },
  "7-10-C01": {
    v4Code: "V4-CN-03",
    level: "adjust_lesson_mode",
    badge: "Phân tách Bài 29 & Bài 30",
    lessonScopes: [
      { lesson: 29, label: "Bài 29: Nhận diện biến cố & tập kết quả" },
      { lesson: 30, label: "Bài 30: Xác suất đồng khả năng P = 1/2" }
    ],
    scopeNote: "Bài 29 tập trung nhận diện phép thử ngẫu nhiên, kết quả có thể và biến cố chắc chắn/không thể/ngẫu nhiên; giá trị xác suất P(Sấp) = P(Ngửa) = 1/2 thuộc Bài 30."
  },
  "toan6-hinh-thoi": {
    v4Code: "V4-CN-04",
    level: "adjust_lesson_mode",
    badge: "Phân tách Bài 19 & Bài 20",
    lessonScopes: [
      { lesson: 19, label: "Bài 19: Nhận biết 4 cạnh bằng nhau & hai đường chéo vuông góc" },
      { lesson: 20, label: "Bài 20: Chu vi P = 4a & Diện tích S = ½·d₁·d₂" }
    ],
    scopeNote: "Bài 19 nhận biết yếu tố cạnh đối song song, 4 cạnh bằng nhau và hai đường chéo vuông góc; công thức chu vi P = 4a và diện tích S = ½·d₁·d₂ thuộc Bài 20."
  },
  "8-06-C08": {
    v4Code: "V4-CN-05",
    level: "adjust_lesson_mode",
    badge: "Thuật ngữ SGK Bài 37",
    displayTitle: "Hình đồng dạng qua phép vị tự (phối cảnh tâm O)",
    scopeNote: "Nhấn mạnh ba điểm O, A, A′ thẳng hàng, tỉ số vị tự OA′/OA = k (cạnh nhân |k|) và bảo toàn số đo các góc tương ứng."
  },
  "7-01-C02": {
    v4Code: "V4-CN-06",
    level: "supplementary",
    badge: "Trực quan Bài 6 (Pythagore chứng minh ở Lớp 8)",
    scopeNote: "Hoạt động chính Bài 6 là đọc và ước lượng vị trí √n trên trục số; tam giác vuông chỉ mang tính minh họa trực quan (định lí Pythagore chính thức học ở Toán 8)."
  },
  "7-08-C03": {
    v4Code: "V4-CN-07",
    level: "supplementary",
    badge: "Khai triển 2D & Gấp 3D Bài 36",
    scopeNote: "Phân biệt rõ 4 mặt bên hình chữ nhật và 2 mặt đáy bằng nhau không chồng lấn trên bản khai triển phẳng 2D trước khi gấp thành khối 3D."
  },
  "7-09-C03": {
    v4Code: "V4-CN-08",
    level: "supplementary",
    badge: "Khai triển 2D & Gấp 3D Bài 37",
    scopeNote: "Nhấn mạnh 2 đáy tam giác bằng nhau và 3 mặt bên hình chữ nhật có chiều rộng khớp đúng từng cạnh đáy của lăng trụ đứng."
  },
  "8-09-C03": {
    v4Code: "V4-CN-09",
    level: "supplementary",
    badge: "Khai triển Bài 38 (3 mặt bên) & Bài 39 (4 mặt bên)",
    scopeNote: "Chế độ đáy tam giác đều (Bài 38) gồm 1 đáy tam giác đều + 3 mặt bên tam giác cân bằng nhau; chế độ đáy vuông (Bài 39) gồm 1 đáy vuông + 4 mặt bên tam giác cân."
  },
  "10-02-C03": {
    v4Code: "V4-CN-10",
    level: "optional_extension",
    badge: "[Mở rộng / Vận dụng Bài 4]",
    scopeNote: "Trọng tâm chuẩn Bài 4 là xác định miền nghiệm đa giác của hệ bất phương trình bậc nhất hai ẩn; bài toán tìm cực trị F(x,y) = ux + vy tại đỉnh đa giác là phần vận dụng mở rộng."
  },
  "11-12-C03": {
    v4Code: "V4-CN-11",
    level: "supplementary",
    badge: "Bổ sung quy tắc tính đạo hàm Bài 32",
    scopeNote: "Trước khi đối chiếu đồ thị f(x) và f′(x), học sinh áp dụng quy tắc đạo hàm lũy thừa/tổng/hiệu: với f(x) = ax² + bx thì f′(x) = 2ax + b; nghiệm f′(x) = 0 là x = −b/(2a)."
  },
  "9-11-C03": {
    v4Code: "V4-CN-12",
    level: "optional_extension",
    badge: "[Mở rộng trực quan Bài 32]",
    scopeNote: "Mô hình mở rộng trực quan cho Bài 32 (Hình cầu): điều kiện cắt hợp lệ 0 ≤ d ≤ R, bán kính đường tròn mặt cắt r = √(R² − d²); khi d = 0 được đường tròn lớn r = R."
  },
  "11-09-C03": {
    v4Code: "V4-CN-13",
    level: "optional_extension",
    badge: "[Mở rộng / Vận dụng Bài 27]",
    scopeNote: "Mở rộng từ thể tích khối chóp và khối lăng trụ Bài 27: V = (h/3)(B₁ + B₂ + √(B₁B₂)). Khi đáy trên tiến tới bằng đáy dưới (a → b), thể tích tiến tới lăng trụ V = B·h."
  },
  "12-07-C02": {
    v4Code: "V4-CN-14",
    level: "optional_extension",
    badge: "[Tùy trường hợp / Mở rộng Bài 13]",
    scopeNote: "Mở rộng vòng đệm (washer) cho Bài 13 với điều kiện bắt buộc R(x) ≥ r(x) ≥ 0 trên [a, b]: V = π ∫ [R²(x) − r²(x)] dx; khi r(x) = 0 thu về khối tròn xoay đặc chuẩn SGK."
  },
  "12-10-C03": {
    v4Code: "V4-CN-15",
    level: "optional_extension",
    badge: "[Mở rộng trực quan Bài 17]",
    scopeNote: "Mở rộng trực quan Bài 17 (Phương trình mặt cầu): so sánh khoảng cách d = d(I, Δ) với bán kính R để phân biệt 3 trường hợp: d > R (0 giao điểm), d = R (1 tiếp điểm), d < R (2 giao điểm)."
  }
};

export function getV4PedagogyMeta(modeId) {
  return V4_MODEL_PEDAGOGY_NOTES[modeId] || null;
}

// Fast lookup tables
export const CURRICULUM_CHAPTERS_BY_GRADE = new Map();
export const CURRICULUM_CHAPTER_BY_ID = new Map();
export const CURRICULUM_MODEL_BY_ID = new Map();
export const CURRICULUM_MODEL_BY_NUM = new Map();
export const ALL_CURRICULUM_MODELS = [];

for (const g of CURRICULUM_CHAPTERS_MANIFEST.grades) {
  CURRICULUM_CHAPTERS_BY_GRADE.set(g.grade, g.chapters);
  for (const ch of g.chapters) {
    CURRICULUM_CHAPTER_BY_ID.set(ch.id, { ...ch, grade: g.grade, gradeName: g.name });
    for (const les of ch.lessons) {
      for (const m of les.models) {
        const override = RELOCATED_MODEL_OVERRIDES[m.id];
        const defaultLab = GRADE6_LAB_BY_MODEL_ID[m.id] || m.id.replace(/-C\d+$/, '');
        const sourceGrade = override ? override.sourceGrade : g.grade;
        const targetGrade = override ? override.targetGrade : g.grade;
        const sourceLabId = override ? override.sourceLabId : defaultLab;
        const targetLabId = override ? override.targetLabId : defaultLab;
        m.sourceGrade = sourceGrade;
        m.targetGrade = targetGrade;
        m.sourceLabId = sourceLabId;
        m.targetLabId = targetLabId;
        const v4Meta = V4_MODEL_PEDAGOGY_NOTES[m.id] || null;
        if (v4Meta) m.v4Meta = v4Meta;
        const entry = {
          ...m,
          grade: g.grade,
          gradeName: g.name,
          chapterId: ch.id,
          chapterNum: ch.number,
          chapterTitle: ch.title,
          volume: ch.volume,
          lessonNum: les.lesson,
          lessonTitle: les.title,
          sourceGrade,
          targetGrade,
          sourceLabId,
          targetLabId,
          v4Meta
        };
        CURRICULUM_MODEL_BY_ID.set(m.id, entry);
        CURRICULUM_MODEL_BY_NUM.set(m.num, entry);
        ALL_CURRICULUM_MODELS.push(entry);
      }
    }
  }
}

export function getChaptersForGrade(grade) {
  return CURRICULUM_CHAPTERS_BY_GRADE.get(Number(grade)) || [];
}

export function getChapterById(chapterId) {
  return CURRICULUM_CHAPTER_BY_ID.get(chapterId) || null;
}

export function getCurriculumModelById(modeId) {
  return CURRICULUM_MODEL_BY_ID.get(modeId) || null;
}

export function getCurriculumModelByNumber(num) {
  return CURRICULUM_MODEL_BY_NUM.get(Number(num)) || null;
}

export function getAllCurriculumModels() {
  return ALL_CURRICULUM_MODELS;
}
