db.users.drop();
db.users.createIndex({
  email: 1
}, {
  unique: true
});
db.users.insertMany([{
  employeeCode: '201901001',
  email: 'akimi.ishitsuka@paypay.ne.jp',
  name: 'Akimi Ishitsuka',
  role: 10,
  hashedPassword: 'ffa733daa09237ff6cea468daae87a9fd63b7b81dcdae68d4cd321836294d9360809c6ce73cc8e78176187f192251f3454e65ce3bef6291ed6ae379d84cdc014',
  salt: 'd1a7cc71a0c874e9',
  imageUrl: 'https://randomuser.me/api/portraits/men/55.jpg'
},
{
  employeeCode: '201901002',
  email: 'shunichi.matsumura@paypay.ne.jp',
  name: 'Shunichi Matsumura',
  role: 1,
  hashedPassword: 'aa17cff2a7387f400716a069c29745e0f0030f9f05e1dcba3b395e24fbd7fb5221b3b7ff31fada65c6891588641450e49edaf73cc9e91465b7563a403eb0097d',
  salt: '4a21d237268ff614',
  imageUrl: 'https://randomuser.me/api/portraits/women/20.jpg'
},
{
  employeeCode: '201901003',
  email: 'ryoichi.akamatsu@paypay.ne.jp',
  name: 'Ryoichi Akamatsu',
  role: 1,
  hashedPassword: '7f372aadd72b1620e14bd30933662b6baa46dc24de994cda52a48111d3579d55abfc31976d6f0556d2ac9304131ef9beb20a57f1a72847fb05361d29509a72bd',
  salt: '0fe64f63dda5fadb',
  imageUrl: 'https://randomuser.me/api/portraits/men/87.jpg'
},
{
  employeeCode: '201901004',
  email: 'hideyuki.kawakami@paypay.ne.jp',
  name: 'Hideyuki Kawakami',
  role: 1,
  hashedPassword: '0d5a815fda39830f4eebb03b0a295d97f30ffbc546ea22a9f1e2ef13419ed03fcd17a55f3539e6e2e667a8cdc6eaf513fcfbeae5f3f0a1ebd22be79514cc8381',
  salt: '04c903de1799ec31',
  imageUrl: 'https://randomuser.me/api/portraits/women/83.jpg'
},
{
  employeeCode: '201901005',
  email: 'nobuyuki.nagaya@paypay.ne.jp',
  name: 'Nobuyuki Nagaya',
  role: 1,
  hashedPassword: '24db7c287dacfc01bb95a5a76e05c2cda44ada61183ff3ddbd59a17e2af1a1d8c8e346ef8288767a1d30dbed576751c22171a0e6456491d5e0b57ec3688c9116',
  salt: '5e8f92135fdf6587',
  imageUrl: 'https://randomuser.me/api/portraits/men/85.jpg'
},
{
  employeeCode: '201901006',
  email: 'toshihiko.takezawa@paypay.ne.jp',
  name: 'Toshihiko Takezawa',
  role: 1,
  hashedPassword: '96602a03c59c88947186033e2a50df93b91bd153083fdb25db6a3e1a85e2fd6274466230d5fae0c32ed99bd1c00cf2f1e5b50fde13e7f0feed6f54ecf51b150c',
  salt: '218633db7fa49c16',
  imageUrl: 'https://randomuser.me/api/portraits/women/7.jpg'
},
{
  employeeCode: '201903001',
  email: 'tatsuya.matayoshi@paypay.ne.jp',
  name: 'Tatsuya Matayoshi',
  role: 1,
  hashedPassword: '7866505a1f1772fa071c8f993e73f3cc17ab01f28a4125789cb4df3476de2a974fd7fe9ee83a4aa492c783c737707e1e93ed84915dd0ace1619962588280136b',
  salt: 'a4bc99b4ec44b4f7',
  imageUrl: 'https://randomuser.me/api/portraits/men/58.jpg'
},
{
  employeeCode: '201903002',
  email: 'naoto.sakurada@paypay.ne.jp',
  name: 'Naoto Sakurada',
  role: 1,
  hashedPassword: '00fc0d0887f9337243d072903de861f92ff088bd23f2a4e8126a8d8d8d8d351e783f69446d9411ae4ead980f8ad9d4bca540f62d898952feea5911797bfde36d',
  salt: 'edbec4d8c43b4714',
  imageUrl: 'https://randomuser.me/api/portraits/women/45.jpg'
},
{
  employeeCode: '201903003',
  email: 'naoyuki.odaka@paypay.ne.jp',
  name: 'Naoyuki Odaka',
  role: 1,
  hashedPassword: '56b1bc62ba873f1c9cc34314eadb98db594dde12d027bb597bf62e84fa1581b2b95ff57902ec450adfc36701c3131a6db0854ff2420444427b064295dfa9c16b',
  salt: '860a42b03a18bce6',
  imageUrl: 'https://randomuser.me/api/portraits/men/63.jpg'
},
{
  employeeCode: '201903004',
  email: 'tomoaki.kamioka@paypay.ne.jp',
  name: 'Tomoaki Kamioka',
  role: 1,
  hashedPassword: '46b7fcc239f94320e581e7d498bbdf638b4bf79f2e244e1eeccc441ac70c9150a8f5f9e97b8348ddfdf5280618c13272020407d555b3efd10dc416ba117df9c7',
  salt: '2473945ec266b243',
  imageUrl: 'https://randomuser.me/api/portraits/women/59.jpg'
},
{
  employeeCode: '201904001',
  email: 'kazuhiro.imazeki@paypay.ne.jp',
  name: 'Kazuhiro Imazeki',
  role: 1,
  hashedPassword: '611a918648206a478e1533609809ad29cf9ba5cdc384d771bb1bc57d527e087a60aa35be8db2021efff60d9baaf0ed6a60deb741b7b969930f999c193a621d16',
  salt: '4e4c770316e83635',
  imageUrl: 'https://randomuser.me/api/portraits/men/62.jpg'
},
{
  employeeCode: '201904002',
  email: 'kenta.maki@paypay.ne.jp',
  name: 'Kenta Maki',
  role: 1,
  hashedPassword: 'abb05545640e4359bae7c40045e43f0b7a1209c1436f2b17752560f9a94ade9beb6e3bbca124bc9ce5ceb7d88f579b0bc58f21cc1ef1e81881cfbb19b6394c62',
  salt: '9037bd19113b6270',
  imageUrl: 'https://randomuser.me/api/portraits/women/51.jpg'
},
{
  employeeCode: '201904003',
  email: 'kazuyuki.ino@paypay.ne.jp',
  name: 'Kazuyuki Ino',
  role: 1,
  hashedPassword: '9c66600f60294479edd4922a86fc6ace7fc030951904cb66db58f851c760ae192e72d3b5602f5f8dde5e427640c79b34254690b7e5fb6c758d999368a5db8d45',
  salt: '29f4f9a9db8f62a3',
  imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg'
},
{
  employeeCode: '201904004',
  email: 'tomohiko.obuchi@paypay.ne.jp',
  name: 'Tomohiko obuchi',
  role: 1,
  hashedPassword: '460a1f4d56deacf1605889e3b22de784ea75f82ac1f2bd42b1ef9f2931a8bbfbd78ae2abe8f5d44f19325d0ef7df6d58e22ccb678dcd33aeb1589c69a1801184',
  salt: 'c7c7552b46c8353c',
  imageUrl: 'https://randomuser.me/api/portraits/women/72.jpg'
},
{
  employeeCode: '201904005',
  email: 'yuto.kayahara@paypay.ne.jp',
  name: 'Yuto Kayahara',
  role: 1,
  hashedPassword: 'f8314e3b95398323340454970a190d3dc36327654e10e2dfefc8082ffeaae52058b6a1cb3e8fb8c8546eb6b0e53f0801750f7f5bd6a19938a07e18b119d90c22',
  salt: '011aa234ba8e0153',
  imageUrl: 'https://randomuser.me/api/portraits/men/0.jpg'
},
{
  employeeCode: '201904006',
  email: 'kozo.asakawa@paypay.ne.jp',
  name: 'Kozo Asakawa',
  role: 1,
  hashedPassword: '6856c890e147f68926cf0e1a5d51b0b1ece695ebd9f4d42b7e729a299ff17bf2c655236026f60354c97f4d7fd2607eb262e3b5fdff3a4824e7d37440d60c560f',
  salt: 'bbb22a6778c77bc9',
  imageUrl: 'https://randomuser.me/api/portraits/women/42.jpg'
},
{
  employeeCode: '201904007',
  email: 'noriyuki.mineo@paypay.ne.jp',
  name: 'Noriyuki Mineo',
  role: 1,
  hashedPassword: '320a6d2e3d0d2a06c5516bf65da4c353373cea66259e25824a2c1252a7f70e5fb316a53e5fbf83c77ab81b8fa81d4996271f907c6999d9a4f7c10a940baa4e63',
  salt: 'd206578aed3a3c1c',
  imageUrl: 'https://randomuser.me/api/portraits/men/47.jpg'
},
{
  employeeCode: '201904008',
  email: 'masayoshi.ikei@paypay.ne.jp',
  name: 'Masayoshi Ikei',
  role: 1,
  hashedPassword: '488d200a12ea15720192121d77de0fe06b8425f3fb1a5a1ad5db7c605c8e6babea0061beca9d1f9a3922cb4b8bb430321a74e9b41776fc6a332bbe4433a23cac',
  salt: 'e38b88ba2239ea92',
  imageUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
},
{
  employeeCode: '201904009',
  email: 'masahiro.sakurazawa@paypay.ne.jp',
  name: 'Masahiro Sakurazawa',
  role: 1,
  hashedPassword: 'c83f78cb5f9a418652266410e311d5bff602afe6d11da04027babaa4ec154a3d5a0f31b66dcad7b28c61d868ff3d735b335257739c8d06960cc767447c576a19',
  salt: '5a6aa9c38a12fd9b',
  imageUrl: 'https://randomuser.me/api/portraits/men/13.jpg'
},
{
  employeeCode: '201904010',
  email: 'ko.kamiura@paypay.ne.jp',
  name: 'Ko Kamiura',
  role: 1,
  hashedPassword: 'c48e205d4b92273dfd4e02964efc2c8945ee0db0262cae4e5af4c39504cc6a1cfc970bdb84c5002aa5443aa16422da7fd33dfb450ba7abe59deaa5dc20a2000c',
  salt: '1e26297e1472ba2d',
  imageUrl: 'https://randomuser.me/api/portraits/women/6.jpg'
},
{
  employeeCode: '201904011',
  email: 'hiroshi.noba@paypay.ne.jp',
  name: 'Hiroshi Noba',
  role: 1,
  hashedPassword: '5091b4bdb03e95cd0f2e4ebb1663b839429dced6c97b09d37ed78717a6cf303b42c4c1cf16615ce395730af15a95b5941e17064bf9a04d7eb07090f47735a214',
  salt: 'fc1600928a4603b4',
  imageUrl: 'https://randomuser.me/api/portraits/men/70.jpg'
},
{
  employeeCode: '201904012',
  email: 'akihide.isozumi@paypay.ne.jp',
  name: 'Akihide Isozumi',
  role: 1,
  hashedPassword: 'b05ad00fb670b4ff7fe2811a417facf4a10242597a2061fda66c133a9298b8976f5f27dd9a4e569a20f4b2fc6e6876eb560dbf4262f8c62dd3c643133939dd3e',
  salt: '1378b5d6084810aa',
  imageUrl: 'https://randomuser.me/api/portraits/women/63.jpg'
},
{
  employeeCode: '201904013',
  email: 'keiji.doman@paypay.ne.jp',
  name: 'Keiji Doman',
  role: 1,
  hashedPassword: 'f21dd5dc49c570f8ed8dac4d5927e29988eb6752e29d5cde9bdf76035b230b9a8bc748c1d36aa5309a1d4cb5907dc10b345352438e2969e006ec1b83618b4ab9',
  salt: 'ac75040833625553',
  imageUrl: 'https://randomuser.me/api/portraits/men/31.jpg'
},
{
  employeeCode: '201904014',
  email: 'shota.shimomae@paypay.ne.jp',
  name: 'Shota Shimomae',
  role: 1,
  hashedPassword: 'bc013ac60a3a9903a1cc954d5fccfb46996ad93df209332bf34f0ed686d79856951c1efafddfecb6ec952a4ad470f5711d3fc0aa1675af46d4f3eea3f1c575b7',
  salt: '9866877810b68b0c',
  imageUrl: 'https://randomuser.me/api/portraits/women/78.jpg'
},
{
  employeeCode: '201904015',
  email: 'tamotsu.chono@paypay.ne.jp',
  name: 'Tamotsu Chono',
  role: 1,
  hashedPassword: '41a5ff2a3f0294a947b93aafffa4cff6d6c47872915bdd6b6da50e3a49620f92156e4e4768bd56bd3e178e3af55f78f6decc412f62142c48bd9148cf0af7348a',
  salt: 'd7803d77ba231d6f',
  imageUrl: 'https://randomuser.me/api/portraits/men/34.jpg'
},
{
  employeeCode: '201904016',
  email: 'akinori.nitahara@paypay.ne.jp',
  name: 'Akinori Nitahara',
  role: 1,
  hashedPassword: 'a23a9d791c4fde9b01f09a1de3af005a60533ae5af045200b5e82f655415c7a561033fd67fe1bc2bf009a24d3bfc109a8ff681225b91db83561c9aedbeba7199',
  salt: '3f371816e7bde21c',
  imageUrl: 'https://randomuser.me/api/portraits/women/82.jpg'
},
{
  employeeCode: '201904017',
  email: 'yutaka.amada@paypay.ne.jp',
  name: 'Yutaka Amada',
  role: 1,
  hashedPassword: '30dc87a28135cf1161f6c90320dfa27943f1e79a358de9321bf0a62a4937fbf8170549123035a17d1868fe4324ee4b8031df7efeb289563657f729e133673334',
  salt: 'eafcb0e291e729a7',
  imageUrl: 'https://randomuser.me/api/portraits/men/48.jpg'
},
{
  employeeCode: '201904018',
  email: 'kosuke.kake@paypay.ne.jp',
  name: 'Kosuke Kake',
  role: 1,
  hashedPassword: 'a68e3d8035bd840521d06a7b18f30c2c89586085b9a4c27613aa93f0dc45eb7192bca39862aed3f820e74d95d261e8dc228af0baa0f633ba86d072957d03204e',
  salt: '95ab7b8701b1c1d7',
  imageUrl: 'https://randomuser.me/api/portraits/women/88.jpg'
},
{
  employeeCode: '201904019',
  email: 'tomofumi.ishise@paypay.ne.jp',
  name: 'Tomofumi Ishise',
  role: 1,
  hashedPassword: '9f6ca33b02cc8435a95289d94097e359968710406681f813ee0a3c918ff4061cc0dce62a4651ca9e5e7470e6299b33866a0c41d77ffcb7d861bf1555a6f4473b',
  salt: '2476792a3da493aa',
  imageUrl: 'https://randomuser.me/api/portraits/men/41.jpg'
},
{
  employeeCode: '201904020',
  email: 'kosuke.haniu@paypay.ne.jp',
  name: 'Kosuke Haniu',
  role: 1,
  hashedPassword: '940699c540efc2d47b6a203009a1a132c859c1150f4187b0cbaff71a06e2c0ad58d9ca7e842f24e9deeb173b3f747f46971c56a94049480840fb2d6d02024cb4',
  salt: 'afc6db5795ab90e5',
  imageUrl: 'https://randomuser.me/api/portraits/women/84.jpg'
},
{
  employeeCode: '201904021',
  email: 'takaki.narutaki@paypay.ne.jp',
  name: 'Takaki Narutaki',
  role: 1,
  hashedPassword: '362f76b65218a9c2f8f78f85dd962607b0815540abf680a58475def3eab0eb227bd4e9e0df9f40ada87d1a0eca06d2c7801829d8f33d1f511be2edd3f4bbdaf4',
  salt: '0f160de8c93077ce',
  imageUrl: 'https://randomuser.me/api/portraits/men/60.jpg'
},
{
  employeeCode: '201904022',
  email: 'shigenori.oyaizu@paypay.ne.jp',
  name: 'Shigenori Oyaizu',
  role: 1,
  hashedPassword: 'e470e58df34f5e0a989ffcc04dd9bdab8529de7738249d5c7500eac0a12f6eb33b5d3eb941ec422a6af94e2e2ffe94c011337d8d1fef41e9a70bd75efdfb3b6b',
  salt: 'bfba3089e713bebe',
  imageUrl: 'https://randomuser.me/api/portraits/women/66.jpg'
},
{
  employeeCode: '201904023',
  email: 'yuma.mitsuo@paypay.ne.jp',
  name: 'Yuma Mitsuo',
  role: 1,
  hashedPassword: '284a5d8793fe1a47b4b0dfbe2d4d8a4daa300c19406d220b5923c075c82cb1b15e53713ec94d80cb45251fdffb7381b4d4533993cff0e5c7332c4c0afc6b23f3',
  salt: '17b21ee5533d2161',
  imageUrl: 'https://randomuser.me/api/portraits/men/76.jpg'
},
{
  employeeCode: '201904024',
  email: 'naohito.iri@paypay.ne.jp',
  name: 'Naohito Iri',
  role: 1,
  hashedPassword: 'fdcd513bf0fa815f81891ac4a29f65a7378c00b1ddb8dc4ec6b372178682bc3a1e0a08565551353cb106a7e617553c4618e96c42736ea89a7952dc7c991810b4',
  salt: '10b4298f3a698bfe',
  imageUrl: 'https://randomuser.me/api/portraits/women/61.jpg'
},
{
  employeeCode: '201904025',
  email: 'rikio.nishikido@paypay.ne.jp',
  name: 'Rikio Nishikido',
  role: 1,
  hashedPassword: 'f970691c8834f62bf09b7a747ce97972ecfa292aaa1c1484540b0589528476bf3de7b85358b3bb978a2d9ed8a4d6a8b309718af86a311b6fb44f2ddaa27bbbba',
  salt: '24c12a3cad99130f',
  imageUrl: 'https://randomuser.me/api/portraits/men/12.jpg'
},
{
  employeeCode: '201904026',
  email: 'takaya.gosho@paypay.ne.jp',
  name: 'Takaya Gosho',
  role: 1,
  hashedPassword: 'f5d8aab6dc0030121ccdf585067ddc7fd07c362c1c139707f9927c58cc304bfc7368f6f8365b73cc4f7e3d680d698f6bcd7dae8633b3dfd1f9f8bfda58c36808',
  salt: '4532da9060e938c6',
  imageUrl: 'https://randomuser.me/api/portraits/women/15.jpg'
},
{
  employeeCode: '201905001',
  email: 'iwao.kabuki@paypay.ne.jp',
  name: 'Iwao Kabuki',
  role: 1,
  hashedPassword: '014919a4b3bf9d94c30a3e436a459b332fab6a21b82cfd61cfce6ea99813c84617beea37efedfdb41e9a1ce37f5c2a68a1b345bbdecfa677052dc49bea4d070b',
  salt: '1139fc9efc447488',
  imageUrl: 'https://randomuser.me/api/portraits/men/56.jpg'
},
{
  employeeCode: '201905002',
  email: 'haruki.saikawa@paypay.ne.jp',
  name: 'Haruki Saikawa',
  role: 1,
  hashedPassword: '8b0b9a2d57a9576b8ba6db26c66eafee3668456d1a0eaf1becf925c4fc215fc78474be3ffd258b59270730a4b44649831413f7e8cb8041ead0e8f4bc791021f1',
  salt: '2f69760bdee27f49',
  imageUrl: 'https://randomuser.me/api/portraits/women/0.jpg'
},
{
  employeeCode: '201905003',
  email: 'takahiro.fukumorita@paypay.ne.jp',
  name: 'Takahiro Fukumorita',
  role: 1,
  hashedPassword: '591c009b56a747cbb5b900d393db381327f9ae64ebeb584bb338c018b14cd4ba277a51c8378a94531868890c9f4f5df22ef57ab9eaf74d14a07efd3558bb482c',
  salt: '907d9f45f41762f9',
  imageUrl: 'https://randomuser.me/api/portraits/men/52.jpg'
},
{
  employeeCode: '201905004',
  email: 'rei.kozuma@paypay.ne.jp',
  name: 'Rei Kozuma',
  role: 1,
  hashedPassword: 'a0c11e2408501c565a2a34c0119d61afebf8c4ab05f1d1205dec771237203f2589102fb77b85c7f7d7f2724aeb85d7e76be710b1589d0b80972a4999219ce13f',
  salt: 'cea6598502396fc1',
  imageUrl: 'https://randomuser.me/api/portraits/women/43.jpg'
},
{
  employeeCode: '201905005',
  email: 'hironobu.kankawa@paypay.ne.jp',
  name: 'Hironobu Kankawa',
  role: 1,
  hashedPassword: '15c924d7fb2927f55c371e79ed0e6a9d9d6923d2fc0192e330bdc9cb57a43a11f06d3f42a87040f3ad2ed038763a3b9817362989d9272a1f6465e1095cc8cb7a',
  salt: '8908aa22a6fcaa5d',
  imageUrl: 'https://randomuser.me/api/portraits/men/8.jpg'
},
{
  employeeCode: '201905006',
  email: 'haruyoshi.marui@paypay.ne.jp',
  name: 'Haruyoshi Marui',
  role: 1,
  hashedPassword: '2d61106da1fd474e5ae052a55a2793bd459a5da6f16207bfc45bc9364f796eeb83952403d3cd6f51178e18b218aef6b256221d105ba34a9a8038dc04c2733024',
  salt: '06f8027ed1efcd8e',
  imageUrl: 'https://randomuser.me/api/portraits/women/17.jpg'
},
{
  employeeCode: '201905007',
  email: 'masatoshi.sugaki@paypay.ne.jp',
  name: 'Masatoshi Sugaki',
  role: 1,
  hashedPassword: 'f2b1e2c640d6ed4fdb8252f118e3f095234f1df7259a66183a43a62b100916c54754dfde5520fe5347ce4772374d3627d646f9827044f504ea39167f54991f9f',
  salt: 'c31e631ac953ea31',
  imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
},
{
  employeeCode: '201905008',
  email: 'tatsuji.okisawa@paypay.ne.jp',
  name: 'Tatsuji Okisawa',
  role: 1,
  hashedPassword: '0ae032d1a4a21db6f0938c60abd0298f27e725ff35b150b9de69825ebfccff80fde35511a137520ae6714f34084b21b45df96e397006bf0d11d9a52f789128e7',
  salt: '6c88372b5345c3fe',
  imageUrl: 'https://randomuser.me/api/portraits/women/81.jpg'
},
{
  employeeCode: '201905009',
  email: 'tasuku.chida@paypay.ne.jp',
  name: 'Tasuku Chida',
  role: 1,
  hashedPassword: 'b50037735d4993b160964b913c9f21e287123b72efbcd63d4d03e48278ee569d749c8192e2406c3bbfa7e49f512c51b03697205222858815d62745d8fe4bad83',
  salt: '378ce7e7a21321f9',
  imageUrl: 'https://randomuser.me/api/portraits/men/57.jpg'
},
{
  employeeCode: '201905010',
  email: 'shigeki.sashiwa@paypay.ne.jp',
  name: 'Shigeki Sashiwa',
  role: 1,
  hashedPassword: '1f11f7b400fc29ab5cdd4860267cceddfb7f91143c86d3055303b8c81a17f28608d2c83b915cea5fe934fdbf1812aa9fcf77c380d7c517ff80d7bc8347e5295e',
  salt: 'f866cc81db2de8f2',
  imageUrl: 'https://randomuser.me/api/portraits/women/4.jpg'
},
{
  employeeCode: '201906001',
  email: 'tokumi.kawase@paypay.ne.jp',
  name: 'Tokumi Kawase',
  role: 1,
  hashedPassword: 'a7d4f26418aaf9dbcc5f0dc40b04305c3ae114c89fdaaadd9356449022dde9c9343269469069378495698799e936770d2eebe2c0b23a7b8c7ed0ee256552c85b',
  salt: '91bd35d25640ffbe',
  imageUrl: 'https://randomuser.me/api/portraits/men/72.jpg'
},
{
  employeeCode: '201912001',
  email: 'sho.shiwachi@paypay.ne.jp',
  name: 'Sho Shiwachi',
  role: 1,
  hashedPassword: '7603558b51119ef1b3cc42ddc870d549c9f32e4daf4d522270e77a875e7f196797d27d40c4dd29662983d94ceb91784bbbb14cfa12e58f27b5e4b7b72c0aa685',
  salt: '9201f02006986a31',
  imageUrl: 'https://randomuser.me/api/portraits/women/24.jpg'
},
{
  employeeCode: '201912001',
  email: 'eisuke.karijuku@paypay.ne.jp',
  name: 'Eisuke Karijuku',
  role: 1,
  hashedPassword: '22fdee727acf3c564db17066bd9219aeda24c343a925326dd7f39f2db34ddf4954e9cd006cd11ccbcc3336f46e1bdc299c26760c44fb4c80e185781e1f858f4f',
  salt: '3bbb70f38c66be20',
  imageUrl: 'https://randomuser.me/api/portraits/men/9.jpg'
},
{
  employeeCode: '201912001',
  email: 'sei.tokuchi@paypay.ne.jp',
  name: 'Sei Tokuchi',
  role: 1,
  hashedPassword: 'd720ea338e30027e2b2af9d4cf8e85f2e6130c306bb205251338d126bb73d7b43fd0c699a7bb8f0140de4168a5f7a3cc89c04149dae6f2dc4bf5c198e3483224',
  salt: '47dc996808f4bb3d',
  imageUrl: 'https://randomuser.me/api/portraits/women/32.jpg'
},
{
  employeeCode: '202003001',
  email: 'duc.hoang@paypay.ne.jp',
  name: 'Duc Hoang',
  role: 1,
  hashedPassword: '01421d2dd6fe4948d27c569034f577172235c422a3f22f00d3bc2bec29dd3b9442c7f556ef6fb096692bdd540a3ae0bd922da35754b3a501671d5c86a3ee077e',
  salt: 'fd73a983e3007820',
  imageUrl: 'https://randomuser.me/api/portraits/men/42.jpg'
},
]);

db.roles.drop();
db.roles.insertMany([{
  _id: 1,
  roleName: 'user'
},
{
  _id: 10,
  roleName: 'admin'
},
]);

db.reviewBoards.drop();
db.reviewBoards.insertMany([{
  title: '2020 First Quarter Performance Review',
  description: 'This 2019 annual performance review involves a formal discussion about an employee’s development and performance. The review is a planning process. It involves setting a plan of action for the next period and reviewing what has been achieved in the last period.',
  dueDate: new Date('2020-03-31'),
  reviewFactors: [0, 1, 2, 3]
},]);

db.reviewFactors.drop();
db.reviewFactors.insertMany([{
  _id: 0,
  title: 'General feedback',
  explanation: 'General comments/remarks to the targeted employee. It is most important for the employee, as it is a framework that will guide them in developing goals, assess their own progress and align themselves with the company’s mission.',
  countUnit: 'null',
  minValue: 'null',
  maxValue: 'null',
  inputControl: 'textarea'
},
{
  _id: 1,
  title: 'Performance',
  explanation: 'The appraisal of an employee is directly dependent on the performance that he has shown over a period of time. Every business wants to maximize its profits and depends upon the collective effort of its employees to achieve it. If certain employees perform up and above the expectations and help the company to achieve better results, the organization would appreciate their efforts and give them a raise in their salary. However, employees who have not performed to their full potential and have not led to any major contribution to the company may not find any such favors from the organization.',
  countUnit: 'point',
  minValue: '0',
  maxValue: '100',
  inputControl: 'textarea'
},
{
  _id: 2,
  title: 'Teamwork',
  explanation: 'The way you behave in your office also has a huge impact on the appraisal process. If you are known as a team player and help your colleagues to improve their performance, it is highly likely that the organization would recognize your efforts and reward you handsomely. This is one of the prime reasons that some employees whose performance has not been exceptional still manage to have a healthy raise in their appraisals. On the other hand, if you are someone who spreads rumors and negativity in the workplace, there is a possibility that you would have a tough time during your appraisals.',
  countUnit: 'point',
  minValue: '0',
  maxValue: '10',
  inputControl: 'textarea'
},
{
  _id: 3,
  title: 'Attendance and Punctuality',
  explanation: 'While it is OK to take a day off once in a while, but frequent absenteeism can hamper your appraisal. Once you start calling in sick, your managers develop a negative perception which is hard to shed. Tardiness on your part can also affect your appraisal as an organizations put this to intense scrutiny. Various surveys have found that "average" employees who have lesser absenteeism and are punctual get more favors from the managers, and this is one of the important factors that plays a part during your appraisal.',
  countUnit: 'point',
  minValue: '0',
  maxValue: '10',
  inputControl: 'textarea'
},
{
  _id: 4,
  title: 'Adaptability',
  explanation: 'How efficiently can the employee work under pressure and respond to change',
  countUnit: '%',
  minValue: '0',
  maxValue: '100',
  inputControl: 'textarea'
},
]);

db.reviewRequests.drop();
db.reviewRequests.insertMany([{
  fromEmail: "akimi.ishitsuka@paypay.ne.jp",
  targetEmail: "duc.hoang@paypay.ne.jp",
  reviewBoard: "5e5e722001f805c190ea2e0a",
  requesterEmail: "akimi.ishitsuka@paypay.ne.jp",
  status: "0",
}, {
  fromEmail: "akimi.ishitsuka@paypay.ne.jp",
  targetEmail: "sei.tokuchi@paypay.ne.jp",
  reviewBoard: "5e5e722001f805c190ea2e0a",
  requesterEmail: "akimi.ishitsuka@paypay.ne.jp",
  status: "1",
}, {
  fromEmail: "akimi.ishitsuka@paypay.ne.jp",
  targetEmail: "eisuke.karijuku@paypay.ne.jp",
  reviewBoard: "5e5e722001f805c190ea2e0a",
  requesterEmail: "akimi.ishitsuka@paypay.ne.jp",
  status: "0",
}, {
  fromEmail: "akimi.ishitsuka@paypay.ne.jp",
  targetEmail: "sho.shiwachi@paypay.ne.jp",
  reviewBoard: "5e5e722001f805c190ea2e0a",
  requesterEmail: "akimi.ishitsuka@paypay.ne.jp",
  status: "0",
}, {
  fromEmail: "akimi.ishitsuka@paypay.ne.jp",
  targetEmail: "tokumi.kawase@paypay.ne.jp",
  reviewBoard: "5e5e722001f805c190ea2e0a",
  requesterEmail: "akimi.ishitsuka@paypay.ne.jp",
  status: "0",
}, {
  fromEmail: "akimi.ishitsuka@paypay.ne.jp",
  targetEmail: "shigeki.sashiwa@paypay.ne.jp",
  reviewBoard: "5e5e722001f805c190ea2e0a",
  requesterEmail: "akimi.ishitsuka@paypay.ne.jp",
  status: "0"
}])

db.reviewResults.drop();
db.reviewResults.insertMany([{
  reviewRequestId: "5e5e72b4d1516f0026539113",
  factor_0: "Good guy, code like god",
  factor_1: "Awesome, 10/10",
  factor_2: "Great, working well in team",
  factor_3: "100%, always punctual",
}])