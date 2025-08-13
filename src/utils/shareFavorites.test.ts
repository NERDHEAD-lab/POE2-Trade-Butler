import { buildSimplifiedTree, SimplifiedFolder } from './shareFavorites';
import type { FileSystemEntry } from '../ui/fileSystemEntry';

const testEntries: FileSystemEntry[] = [
  {
    "createdAt": "2025-07-02T15:47:00.305Z",
    "id": "root",
    "modifiedAt": "2025-07-02T15:47:00.305Z",
    "name": "/",
    "parentId": null,
    "type": "folder"
  },
  {
    "createdAt": "2025-07-02T15:47:00.305Z",
    "id": "153aaff7-0178-4c65-9ca5-90baee73ed77",
    "modifiedAt": "2025-07-02T15:47:00.305Z",
    "name": "ㄹㅁㄴㅇㄹ",
    "parentId": "a928a40d-19f0-4393-9fd0-d7a74beb1857",
    "type": "folder"
  },
  {
    "createdAt": "2025-07-02T15:47:00.305Z",
    "id": "b6f7e89c-e1e6-4675-9d32-f94106b733f1",
    "modifiedAt": "2025-07-02T15:47:00.305Z",
    "name": "ㅁㄴㅇㄻㄴㅇㄻ",
    "parentId": "153aaff7-0178-4c65-9ca5-90baee73ed77",
    "type": "folder"
  },
  {
    "createdAt": "2025-07-02T15:47:00.305Z",
    "id": "da5149da-644a-4ff6-9f6f-86f178afe674",
    "metadata": {
      "id": "9v7P3qmCK",
      "url": "https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/9v7P3qmCK"
    },
    "modifiedAt": "2025-07-02T15:47:00.305Z",
    "name": "9v7P3qmCK",
    "parentId": "23acec18-f57a-4519-9ec3-19ce3e93fe1f",
    "type": "file"
  },
  {
    "createdAt": "2025-07-05T05:08:42.497Z",
    "id": "ab685024-7b9f-4660-afa0-8a5faded0ca4",
    "metadata": {
      "id": "YJwEXLbIY",
      "url": "https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/YJwEXLbIY"
    },
    "modifiedAt": "2025-07-05T05:22:16.351Z",
    "name": "YJwEXLbIY",
    "parentId": "a928a40d-19f0-4393-9fd0-d7a74beb1857",
    "type": "file"
  },
  {
    "createdAt": "2025-07-05T06:07:41.240Z",
    "id": "939a0193-f9e9-40cd-b262-e9ba100d7349",
    "modifiedAt": "2025-07-05T06:07:41.240Z",
    "name": "ㅁㄴㅇㄹ",
    "parentId": "b6f7e89c-e1e6-4675-9d32-f94106b733f1",
    "type": "folder"
  },
  {
    "createdAt": "2025-07-05T06:07:43.497Z",
    "id": "c87dc61e-04ba-4d1a-b889-e7656c1938e3",
    "modifiedAt": "2025-07-05T06:07:43.497Z",
    "name": "ㄹㅁㄴㅇㄹ",
    "parentId": "939a0193-f9e9-40cd-b262-e9ba100d7349",
    "type": "folder"
  },
  {
    "createdAt": "2025-07-05T13:19:10.385Z",
    "id": "f4dc65e5-fda1-47eb-bf56-26fe344144b7",
    "modifiedAt": "2025-07-05T13:19:10.385Z",
    "name": "허리띠 너무좋아",
    "parentId": "root",
    "type": "folder"
  },
  {
    "createdAt": "2025-07-05T13:19:24.302Z",
    "id": "dc1aadd5-ef37-4661-8fd4-6142a1bfca04",
    "metadata": {
      "id": "79VBvVrh5",
      "url": "https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/79VBvVrh5"
    },
    "modifiedAt": "2025-07-05T13:19:28.212Z",
    "name": "헤헌",
    "parentId": "f4dc65e5-fda1-47eb-bf56-26fe344144b7",
    "type": "file"
  },
  {
    "createdAt": "2025-07-05T13:19:35.772Z",
    "id": "088ec9c2-53fd-4d7c-a257-ebe980c67749",
    "metadata": {
      "id": "79VBvVrh5",
      "url": "https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/79VBvVrh5"
    },
    "modifiedAt": "2025-07-05T13:19:38.087Z",
    "name": "헤드헌터",
    "parentId": "f4dc65e5-fda1-47eb-bf56-26fe344144b7",
    "type": "file"
  },
  {
    "createdAt": "2025-07-05T13:20:03.983Z",
    "id": "9edc5c98-71a0-46da-8f9b-820f30c78981",
    "metadata": {
      "id": "79VBvVrh5",
      "url": "https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/79VBvVrh5"
    },
    "modifiedAt": "2025-07-05T13:24:23.695Z",
    "name": "헤드헌터 민첩 40이상",
    "parentId": "f4dc65e5-fda1-47eb-bf56-26fe344144b7",
    "type": "file"
  },
  {
    "createdAt": "2025-07-05T13:24:20.930Z",
    "id": "511aac7e-324d-44ac-8874-f3f72b607812",
    "metadata": {
      "id": "79VBvVrh5",
      "url": "https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/79VBvVrh5"
    },
    "modifiedAt": "2025-07-15T13:03:29.861Z",
    "name": "헤드헌터 힘 20이상",
    "parentId": "root",
    "type": "file"
  },
  {
    "createdAt": "2025-07-06T19:07:23.584Z",
    "id": "22e7639f-dc34-480f-b217-5eb353439a11",
    "metadata": {
      "id": "yLQn528UR",
      "url": "https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/yLQn528UR"
    },
    "modifiedAt": "2025-07-06T19:07:23.584Z",
    "name": "내정보",
    "parentId": "root",
    "type": "file"
  },
  {
    "createdAt": "2025-07-15T13:03:55.316Z",
    "id": "c9466bd4-c23f-4d5c-b118-0f168232b20f",
    "modifiedAt": "2025-07-15T13:03:55.316Z",
    "name": "ㅁㄴㅇㄹ",
    "parentId": "f4dc65e5-fda1-47eb-bf56-26fe344144b7",
    "type": "folder"
  },
  {
    "createdAt": "2025-07-15T13:03:57.092Z",
    "id": "8bcdce15-14b8-40d5-84d6-de58e58f9ce2",
    "metadata": {
      "id": "5zq2adeua",
      "url": "https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/5zq2adeua"
    },
    "modifiedAt": "2025-07-15T13:04:33.015Z",
    "name": "ㅁㄴㄻㄴㅁㄴㅇㄻㄴ",
    "parentId": "c9466bd4-c23f-4d5c-b118-0f168232b20f",
    "type": "file"
  },
  {
    "createdAt": "2025-07-15T13:04:07.337Z",
    "id": "c4445eef-d80b-418b-b1fe-351f83622ee3",
    "metadata": {
      "id": "5zq2adeua",
      "url": "https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/5zq2adeua"
    },
    "modifiedAt": "2025-07-15T13:04:07.337Z",
    "name": "5zq2adeua",
    "parentId": "f4dc65e5-fda1-47eb-bf56-26fe344144b7",
    "type": "file"
  },
  {
    "createdAt": "2025-08-08T13:46:15.619Z",
    "id": "caa2de77-7c5a-4fe2-868e-53fb858832d2",
    "modifiedAt": "2025-08-08T13:46:15.619Z",
    "name": "ㅁㄴㅇㄹ",
    "parentId": "root",
    "type": "folder"
  },
  {
    "createdAt": "2025-08-08T13:47:29.828Z",
    "id": "ee1c4e31-2ed0-47f5-badb-f8ec9335f1e5",
    "modifiedAt": "2025-08-08T13:47:29.828Z",
    "name": "ㅁㄴㅇㄻㄴㅇㄹ",
    "parentId": "root",
    "type": "folder"
  }
];

describe('buildSimplifiedTree', () => {

  it('should correctly build a hierarchical tree from a flat array starting at the root', () => {

    const actualTree = buildSimplifiedTree(testEntries, 'c9466bd4-c23f-4d5c-b118-0f168232b20f');

    const expectedTree: SimplifiedFolder = {
      "type": "folder",
      "name": "ㅁㄴㅇㄹ",
      "children": [
        {
          "type": "item",
          "name": "ㅁㄴㄻㄴㅁㄴㅇㄻㄴ",
          "id": "5zq2adeua",
          "region": "kr"
        }
      ]
    };

    expect(actualTree).toEqual(expectedTree);
  });

  it('should return null if the startFolderId does not exist', () => {
    const result = buildSimplifiedTree(testEntries, 'non-existent-id');
    expect(result).toBeNull();
  });

  it('should return null if the startFolderId corresponds to a file', () => {
    const result = buildSimplifiedTree(testEntries, 'c4445eef-d80b-418b-b1fe-351f83622ee3');
    expect(result).toBeNull();
  });
});