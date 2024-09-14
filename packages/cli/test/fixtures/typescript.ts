import { t } from '@wordsmith/native';

interface Item {
  name: string;
  id: number;
}

class ItemRegistry {
  name: string;
  id: number;

  @T('Monday', { _key: 'text.monday' })
  weekday: string;

  @ViewChild('someInput', { static: true })
  someInputRef: ElementRef<any>;

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}

const item: Item = new ItemRegistry(t('Shoes'), 1);
