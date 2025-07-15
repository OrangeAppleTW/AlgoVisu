// 合併排序樹狀結構預定義數據
const MERGE_SORT_STEPS = [
    {
        step: 1,
        title: "初始狀態",
        description: "開始分治法演示：觀察如何將大問題分解成小問題",
        status: "初始陣列：[5, 3, 8, 6, 2, 7, 1, 4]",
        tree: {
            level0: [
                { array: [5,3,8,6,2,7,1,4], status: "current", indices: "0-7" }
            ]
        }
    },
    {
        step: 2,
        title: "第一次分割",
        description: "將陣列分成兩半：左半部 [5,3,8,6] 和右半部 [2,7,1,4]",
        status: "分割階段：從中點切分陣列",
        tree: {
            level0: [
                { array: [5,3,8,6,2,7,1,4], status: "dividing", indices: "0-7" }
            ],
            level1: [
                { array: [5,3,8,6], status: "current", indices: "0-3" },
                { array: [2,7,1,4], status: "current", indices: "4-7" }
            ]
        }
    },
    {
        step: 3,
        title: "繼續分割左半部",
        description: "將左半部 [5,3,8,6] 再分成 [5,3] 和 [8,6]",
        status: "分割階段：處理左半部陣列",
        tree: {
            level0: [
                { array: [5,3,8,6,2,7,1,4], status: "completed", indices: "0-7" }
            ],
            level1: [
                { array: [5,3,8,6], status: "dividing", indices: "0-3" },
                { array: [2,7,1,4], status: "inactive", indices: "4-7" }
            ],
            level2: [
                { array: [5,3], status: "current", indices: "0-1" },
                { array: [8,6], status: "current", indices: "2-3" },
                { array: [], status: "inactive", indices: "" },
                { array: [], status: "inactive", indices: "" }
            ]
        }
    },
    {
        step: 4,
        title: "繼續分割右半部",
        description: "將右半部 [2,7,1,4] 也分成 [2,7] 和 [1,4]",
        status: "分割階段：處理右半部陣列",
        tree: {
            level0: [
                { array: [5,3,8,6,2,7,1,4], status: "completed", indices: "0-7" }
            ],
            level1: [
                { array: [5,3,8,6], status: "completed", indices: "0-3" },
                { array: [2,7,1,4], status: "dividing", indices: "4-7" }
            ],
            level2: [
                { array: [5,3], status: "inactive", indices: "0-1" },
                { array: [8,6], status: "inactive", indices: "2-3" },
                { array: [2,7], status: "current", indices: "4-5" },
                { array: [1,4], status: "current", indices: "6-7" }
            ]
        }
    },
    {
        step: 5,
        title: "完成所有分割",
        description: "所有陣列都分割到單一元素：[5] [3] [8] [6] [2] [7] [1] [4]",
        status: "分割階段完成：到達基礎情況（單一元素）",
        tree: {
            level0: [
                { array: [5,3,8,6,2,7,1,4], status: "completed", indices: "0-7" }
            ],
            level1: [
                { array: [5,3,8,6], status: "completed", indices: "0-3" },
                { array: [2,7,1,4], status: "completed", indices: "4-7" }
            ],
            level2: [
                { array: [5,3], status: "completed", indices: "0-1" },
                { array: [8,6], status: "completed", indices: "2-3" },
                { array: [2,7], status: "completed", indices: "4-5" },
                { array: [1,4], status: "completed", indices: "6-7" }
            ],
            level3: [
                { array: [5], status: "current", indices: "0" },
                { array: [3], status: "current", indices: "1" },
                { array: [8], status: "current", indices: "2" },
                { array: [6], status: "current", indices: "3" },
                { array: [2], status: "current", indices: "4" },
                { array: [7], status: "current", indices: "5" },
                { array: [1], status: "current", indices: "6" },
                { array: [4], status: "current", indices: "7" }
            ]
        }
    },
    {
        step: 6,
        title: "開始合併：第一層",
        description: "合併相鄰的單一元素：[5]和[3] → [3,5]，[8]和[6] → [6,8]",
        status: "合併階段：合併單一元素對",
        tree: {
            level0: [
                { array: [5,3,8,6,2,7,1,4], status: "completed", indices: "0-7" }
            ],
            level1: [
                { array: [5,3,8,6], status: "completed", indices: "0-3" },
                { array: [2,7,1,4], status: "completed", indices: "4-7" }
            ],
            level2: [
                { array: [3,5], status: "merging", indices: "0-1" },
                { array: [6,8], status: "merging", indices: "2-3" },
                { array: [2,7], status: "inactive", indices: "4-5" },
                { array: [1,4], status: "inactive", indices: "6-7" }
            ],
            level3: [
                { array: [5], status: "completed", indices: "0" },
                { array: [3], status: "completed", indices: "1" },
                { array: [8], status: "completed", indices: "2" },
                { array: [6], status: "completed", indices: "3" },
                { array: [2], status: "inactive", indices: "4" },
                { array: [7], status: "inactive", indices: "5" },
                { array: [1], status: "inactive", indices: "6" },
                { array: [4], status: "inactive", indices: "7" }
            ]
        }
    },
    {
        step: 7,
        title: "繼續合併：完成第一層",
        description: "完成其餘的合併：[2]和[7] → [2,7]，[1]和[4] → [1,4]",
        status: "合併階段：完成第一層合併",
        tree: {
            level0: [
                { array: [5,3,8,6,2,7,1,4], status: "completed", indices: "0-7" }
            ],
            level1: [
                { array: [5,3,8,6], status: "completed", indices: "0-3" },
                { array: [2,7,1,4], status: "completed", indices: "4-7" }
            ],
            level2: [
                { array: [3,5], status: "completed", indices: "0-1" },
                { array: [6,8], status: "completed", indices: "2-3" },
                { array: [2,7], status: "merging", indices: "4-5" },
                { array: [1,4], status: "merging", indices: "6-7" }
            ],
            level3: [
                { array: [5], status: "completed", indices: "0" },
                { array: [3], status: "completed", indices: "1" },
                { array: [8], status: "completed", indices: "2" },
                { array: [6], status: "completed", indices: "3" },
                { array: [2], status: "completed", indices: "4" },
                { array: [7], status: "completed", indices: "5" },
                { array: [1], status: "completed", indices: "6" },
                { array: [4], status: "completed", indices: "7" }
            ]
        }
    },
    {
        step: 8,
        title: "合併：第二層左半部",
        description: "合併 [3,5] 和 [6,8] 成為 [3,5,6,8]",
        status: "合併階段：處理較大的子陣列",
        tree: {
            level0: [
                { array: [5,3,8,6,2,7,1,4], status: "completed", indices: "0-7" }
            ],
            level1: [
                { array: [3,5,6,8], status: "merging", indices: "0-3" },
                { array: [2,7,1,4], status: "inactive", indices: "4-7" }
            ],
            level2: [
                { array: [3,5], status: "completed", indices: "0-1" },
                { array: [6,8], status: "completed", indices: "2-3" },
                { array: [2,7], status: "completed", indices: "4-5" },
                { array: [1,4], status: "completed", indices: "6-7" }
            ],
            level3: [
                { array: [5], status: "completed", indices: "0" },
                { array: [3], status: "completed", indices: "1" },
                { array: [8], status: "completed", indices: "2" },
                { array: [6], status: "completed", indices: "3" },
                { array: [2], status: "completed", indices: "4" },
                { array: [7], status: "completed", indices: "5" },
                { array: [1], status: "completed", indices: "6" },
                { array: [4], status: "completed", indices: "7" }
            ]
        }
    },
    {
        step: 9,
        title: "合併：第二層右半部",
        description: "合併 [2,7] 和 [1,4] 成為 [1,2,4,7]",
        status: "合併階段：完成右半部合併",
        tree: {
            level0: [
                { array: [5,3,8,6,2,7,1,4], status: "completed", indices: "0-7" }
            ],
            level1: [
                { array: [3,5,6,8], status: "completed", indices: "0-3" },
                { array: [1,2,4,7], status: "merging", indices: "4-7" }
            ],
            level2: [
                { array: [3,5], status: "completed", indices: "0-1" },
                { array: [6,8], status: "completed", indices: "2-3" },
                { array: [2,7], status: "completed", indices: "4-5" },
                { array: [1,4], status: "completed", indices: "6-7" }
            ],
            level3: [
                { array: [5], status: "completed", indices: "0" },
                { array: [3], status: "completed", indices: "1" },
                { array: [8], status: "completed", indices: "2" },
                { array: [6], status: "completed", indices: "3" },
                { array: [2], status: "completed", indices: "4" },
                { array: [7], status: "completed", indices: "5" },
                { array: [1], status: "completed", indices: "6" },
                { array: [4], status: "completed", indices: "7" }
            ]
        }
    },
    {
        step: 10,
        title: "最終合併：準備階段",
        description: "準備最終合併：[3,5,6,8] 和 [1,2,4,7] → [1,2,3,4,5,6,7,8]",
        status: "合併階段：準備最終合併",
        tree: {
            level0: [
                { array: [1,2,3,4,5,6,7,8], status: "merging", indices: "0-7" }
            ],
            level1: [
                { array: [3,5,6,8], status: "completed", indices: "0-3" },
                { array: [1,2,4,7], status: "completed", indices: "4-7" }
            ],
            level2: [
                { array: [3,5], status: "completed", indices: "0-1" },
                { array: [6,8], status: "completed", indices: "2-3" },
                { array: [2,7], status: "completed", indices: "4-5" },
                { array: [1,4], status: "completed", indices: "6-7" }
            ],
            level3: [
                { array: [5], status: "completed", indices: "0" },
                { array: [3], status: "completed", indices: "1" },
                { array: [8], status: "completed", indices: "2" },
                { array: [6], status: "completed", indices: "3" },
                { array: [2], status: "completed", indices: "4" },
                { array: [7], status: "completed", indices: "5" },
                { array: [1], status: "completed", indices: "6" },
                { array: [4], status: "completed", indices: "7" }
            ]
        }
    },
    {
        step: 11,
        title: "最終合併：完成",
        description: "完成最終合併：所有元素已正確排序為 [1,2,3,4,5,6,7,8]",
        status: "合併排序完成：得到最終結果",
        tree: {
            level0: [
                { array: [1,2,3,4,5,6,7,8], status: "completed", indices: "0-7" }
            ],
            level1: [
                { array: [3,5,6,8], status: "completed", indices: "0-3" },
                { array: [1,2,4,7], status: "completed", indices: "4-7" }
            ],
            level2: [
                { array: [3,5], status: "completed", indices: "0-1" },
                { array: [6,8], status: "completed", indices: "2-3" },
                { array: [2,7], status: "completed", indices: "4-5" },
                { array: [1,4], status: "completed", indices: "6-7" }
            ],
            level3: [
                { array: [5], status: "completed", indices: "0" },
                { array: [3], status: "completed", indices: "1" },
                { array: [8], status: "completed", indices: "2" },
                { array: [6], status: "completed", indices: "3" },
                { array: [2], status: "completed", indices: "4" },
                { array: [7], status: "completed", indices: "5" },
                { array: [1], status: "completed", indices: "6" },
                { array: [4], status: "completed", indices: "7" }
            ]
        }
    },
    {
        step: 12,
        title: "完成！",
        description: "合併排序完成！所有元素已按升序排列。時間複雜度：O(n log n)",
        status: "演算法執行完成：分治法成功將無序陣列變成有序",
        tree: {
            level0: [
                { array: [1,2,3,4,5,6,7,8], status: "current", indices: "0-7" }
            ],
            level1: [
                { array: [3,5,6,8], status: "completed", indices: "0-3" },
                { array: [1,2,4,7], status: "completed", indices: "4-7" }
            ],
            level2: [
                { array: [3,5], status: "completed", indices: "0-1" },
                { array: [6,8], status: "completed", indices: "2-3" },
                { array: [2,7], status: "completed", indices: "4-5" },
                { array: [1,4], status: "completed", indices: "6-7" }
            ],
            level3: [
                { array: [5], status: "completed", indices: "0" },
                { array: [3], status: "completed", indices: "1" },
                { array: [8], status: "completed", indices: "2" },
                { array: [6], status: "completed", indices: "3" },
                { array: [2], status: "completed", indices: "4" },
                { array: [7], status: "completed", indices: "5" },
                { array: [1], status: "completed", indices: "6" },
                { array: [4], status: "completed", indices: "7" }
            ]
        }
    }
];