namespace PhoneShop.API.Models
{
    public class NewsCategoryMapping
    {
        public int NewsId { get; set; }
        public News? News { get; set; }

        public int CategoryId { get; set; }
        public NewsCategory? Category { get; set; }
    }
}
